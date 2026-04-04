const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const bcrypt = require('bcrypt'); //! npm install bcrypt
const crypto = require('crypto'); //! npm install crypto
const requestIp = require('request-ip'); //! npm install request-ip
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
        console.log(error.message)
        response.status(500).json({
            response: 'Sikertelen eleres!',
            error: error.message
        })
    }
});

router.post('/login', upload.none(), loginMw.validateLogin, async(request, response)=>{
    try {
        const {email, pass} = request.body;
        const ip = requestIp.getClientIp(request);
        const user = await db.findUser(email);
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
        console.log(error.message)
        response.status(500).json({
            response: 'Sikertelen eleres!',
            error: error.message
        })
    }
})

router.post('/logout',loginMw.requireAuthApi,(request, response)=>{
    request.session.destroy((err)=>{
        if (err) {
            return response.status(500).json({
                message: "Logout failed"
            });
        }
        response.clearCookie('connect.sid');

        return response.status(200).json({
            message: "Logged out successfully!"
        });
    });
})

router.get('/username', loginMw.requireAuthApi,async (request, response) => {
    try {
        const user = await db.getUsernameById(request.session.user.id)
        return response.status(200).json({
            username: user.username
        });
    } catch (error) {
        return response.status(500).json({
            message: 'Sikertelen eleres!',
            error: error.message
        });
    }
});

router.post('/request-password', loginMw.requestPassword,async(req, res)=>{
    try {
        const ip = requestIp.getClientIp(req);
        const {email} = req.body;
        const emailCheck = await db.email_exist(email);
        if(emailCheck != 1){
            return res.status(200).json({
                message: 'Ha létezik ilyen email cím, elküldtük a levelet.'
            });
        }
        const token = crypto.randomBytes(32).toString('base64url');
        

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
            "subject": "test",
            "htmlContent": "<html><body><h1>Test</h1></body></html>"
        }
        const resEmail = await postEmail(sendObj);
        db.log_email(email, 'Forgotten password', 'Reset link sent, email_id: '+resEmail.messageId, ip);
        return res.status(200).json({
            message: 'Ha létezik ilyen email cím, elküldtük a levelet.'
        });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message: 'Sikertelen eleres!',
            error: error.message
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
                'api-key':'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'
            },
            body: JSON.stringify(value)
        });
        if(!data.ok){
            const res = await data.json();
            const err = new Error(res.message);
            throw err;
        }
        return await data.json();
    } catch (error) {
        throw error;
    }
}

module.exports = router;