const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const bcrypt = require('bcrypt'); //! npm install bcrypt
const crypto = require('crypto'); //! npm install crypto
const requestIp = require('request-ip'); //! npm install request-ip
require('dotenv').config(); //! npm install dotenv
const apiKey = process.env.BREVO_API_KEY;
const loginMw = require('../middleware/login.middleware.js');
const validateRegistration = require('../middleware/registration.middleware.js');
const multer = require('multer');
const upload = multer();

const saltRounds = 12;

router.post('/registration',upload.none() , validateRegistration, async(request, response) => {
    try {
        const data = request.body;
        const ip = requestIp.getClientIp(request);
        const hashed = await bcrypt.hash(data.pass, saltRounds);
        const insert = Number(await db.registration_insert(data.firstN, data.lastN, data.userN, data.email, hashed));
        await db.log_id(insert, 'registration', 'registration 1/2',ip);
        const admin = await db.ifAdmin(insert);
        request.session.user = {
            id: insert,
            admin: admin
        }
        response.status(201).json({
            message: 'Sikeres regisztráció'
        })
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - /registration', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
});

router.post('/login', upload.none(), loginMw.validateLogin, async(request, response)=>{
    try {
        const {email, pass} = request.body;
        const ip = requestIp.getClientIp(request);
        const user = await db.findUser(email);

        const active = await db.checkIfActive(user.id);
        if(active == 0){
            return response.status(403).json({
                message: 'A felhasználói fiók le van tiltva.',
                id: 5
            });
        }

        const compare = await bcrypt.compare(pass, user.password_hash);

        if(compare == false){
            await db.log_id(user.id,'login','Sikertelen bejelentkezés (Helytelen jelszó)', ip);
            return response.status(401).json({
                message: 'Helytelen jelszó!',
                id: 4
            })
        }
        request.session.user = {
            id: user.id,
            admin: user.admin
        }
        await db.log_id(user.id,'login','Sikeres bejelentkezés', ip);
        response.status(200).json({
            message: 'Sikeres bejelentkezés!'
        })
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - /login', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

router.post('/logout', async (req, res) => {
    try {
        const ip = requestIp.getClientIp(req);

        const user = req.session.user;

        if (user) {
            await db.log_id(user.id, 'logout', 'Sikeres kijelentkezés!', ip);
        }

        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    message: "Logout failed"
                });
            }

            res.clearCookie('connect.sid');

            return res.status(200).json({
                message: "Sikeres kijelentkezés!"
            });
        });

    } catch (error) {
        return res.status(500).json({
            message: "Kijelentkezés sikertelen!"
        });
    }
});

router.get('/username', loginMw.requireAuthApi,async (request, response) => {
    try {
        const user = await db.getUsernameById(request.session.user.id)
        return response.status(200).json({
            username: user.username
        });
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - /username', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
});

router.post('/request-password', loginMw.requestPassword,async(request, response)=>{
    try {
        const ip = requestIp.getClientIp(request);
        const {email} = request.body;
        const emailCheck = await db.email_exist(email);
        //? check if email is registered
        if(emailCheck != 1){
            //? sending feedback (security reason)
            return response.status(200).json({
                message: 'Ha létezik ilyen email cím, elküldtük a levelet.'
            });
        }
        const delUserTokens = await db.delete_tokens(email);
        console.log(delUserTokens);
        //? creating token -> hash token -> save into db
        const token = crypto.randomBytes(32).toString('base64url');
        const token_hash = crypto.createHash('sha256').update(token).digest('hex');
        await db.save_token(email, token_hash);

        //? link for new password + token in url
        const resetLink = `http://127.0.0.1:3000/uj-jelszo?token=${token}`;

        //? brevo POST obj
        const sendObj = {
            "sender":{
                "name": "MuscleMind - Support",
                "email": "musclemind.web@gmail.com"
            },
            "to":[
                {
                "email": email
                }
            ],
            "subject": "Reset your MuscleMind password",
            "htmlContent": `
                <!DOCTYPE html>
                <html>
                <head>
                <meta charset="UTF-8">
                <title>Password Reset</title>
                </head>
                <body style="margin:0; padding:0; background-color:#000000; font-family:Arial, sans-serif;">

                <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
                <tr>
                <td align="center">

                <table width="500" cellpadding="0" cellspacing="0" style="background:#0d0d0d; border-radius:12px; padding:30px; color:#e5e5e5; border:1px solid #1f1f1f;">

                <!-- HEADER -->
                <tr>
                <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:0; color:#ef4444; letter-spacing:2px;">MUSCLEMIND</h1>
                <p style="margin:5px 0 0 0; color:#888;">Gym Tracker</p>
                </td>
                </tr>

                <!-- TITLE -->
                <tr>
                <td align="center" style="padding:20px 0;">
                <h2 style="margin:0; color:#ffffff;">Password Reset</h2>
                </td>
                </tr>

                <!-- TEXT -->
                <tr>
                <td align="center" style="padding-bottom:20px; color:#bbbbbb;">
                <p style="margin:0;">
                You requested a password reset.<br>
                Click the button below to continue.
                </p>
                </td>
                </tr>

                <!-- BUTTON -->
                <tr>
                <td align="center" style="padding:25px 0;">
                <a href="${resetLink}" 
                style="background:#ef4444; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold; display:inline-block; box-shadow:0 0 10px rgba(239,68,68,0.6);">
                    RESET PASSWORD
                </a>
                </td>
                </tr>

                <!-- FALLBACK -->
                <tr>
                <td style="padding-top:20px; font-size:12px; color:#777; text-align:center;">
                <p style="margin:0;">
                If the button doesn't work, use this link:
                </p>
                <p style="word-break:break-all; color:#ef4444;">
                ${resetLink}
                </p>
                </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                <td align="center" style="padding-top:30px; font-size:12px; color:#666;">
                <p style="margin:0;">
                This link expires in 10 minutes.
                </p>
                <p style="margin:5px 0 0 0;">
                If you didn’t request this, ignore this email.
                </p>
                </td>
                </tr>

                </table>

                </td>
                </tr>
                </table>

                </body>
                </html>
                `
        }

        //? POST {sendObj} -> sending email
        const resEmail = await postEmail(sendObj);

        //? creating log about password request
        await db.log_email(email, 'Forgotten password', 'Reset link sent, email_id: '+resEmail.messageId, ip);

        //? sending feedback
        return response.status(200).json({
            message: 'Ha létezik ilyen email cím, elküldtük a levelet.'
        });
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - /request-password', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})
router.post('/check-token', async(request,response)=>{
    try {
        const {token} = request.body;
        if (!token || typeof token !== 'string') {
            return response.status(400).json({
                message: 'Érvénytelen vagy lejárt link.'
            });
        }
        const token_hash = crypto.createHash('sha256').update(token).digest('hex');

        const tokenData = await db.find_token(token_hash);
        if (!tokenData) {
            return response.status(400).json({
                message: 'Érvénytelen vagy lejárt link.'
            });
        }
        if (new Date(tokenData.expires_at) < new Date()) {
            return response.status(400).json({
                message: 'Érvénytelen vagy lejárt link.'
            });
        }
        if (tokenData.used) {
            return response.status(400).json({
                message: 'Érvénytelen vagy lejárt link.'
            });
        }
        return response.status(200).json({
            message: 'Érvényes token.'
        });
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - /check-token', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})
router.post('/new-password', loginMw.newPassword, async(request, response)=>{
    try {
        const ip = requestIp.getClientIp(request);
        const { password, token} = request.body;

        //? token check
        const token_hash = crypto.createHash('sha256').update(token).digest('hex');
        const tokenData = await db.find_token(token_hash);
        if (!tokenData) {
            return response.status(400).json({
                message: 'Érvénytelen vagy lejárt link.'
            });
        }
        if (new Date(tokenData.expires_at) < new Date()) {
            return response.status(400).json({
                message: 'Érvénytelen vagy lejárt link.'
            });
        }
        if (tokenData.used) {
            return response.status(400).json({
                message: 'Érvénytelen vagy lejárt link.'
            });
        }
        const newPass = await bcrypt.hash(password, saltRounds);
        await db.update_password(tokenData.user_id, newPass);
        await db.set_used(tokenData.id);
        await db.log_id(tokenData.user_id, 'Password update', 'Successful update!', ip);

        return response.status(200).json({
            message: 'Sikeres jelszó változtatás!'
        });
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - /new-password', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

router.get('/is-admin', loginMw.requireAuthApi, async(request, response)=>{
    try {
        return response.status(200).json({
            admin: request.session.user.admin
        });
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - /is-admin', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

//! FUNCTIONS
async function postEmail(value) {
    try {
        const data = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-type':'application/json',
                'api-key':apiKey
            },
            body: JSON.stringify(value)
        });
        if(!data.ok){
            const response = await data.json();
            const err = new Error(response.message);
            throw err;
        }
        return await data.json();
    } catch (error) {
        throw error;
    }
}
module.exports = router;