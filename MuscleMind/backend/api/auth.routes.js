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
        console.log(error.message)
        const ip = requestIp.getClientIp(req);
        db.log_error('Server error - auth', error.message,ip);
        return res.status(500).json({
            message: 'Sikertelen eleres!'
        });
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
        const ip = requestIp.getClientIp(req);
        db.log_error('Server error - auth', error.message,ip);
        return res.status(500).json({
            message: 'Sikertelen eleres!'
        });
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

module.exports = router;