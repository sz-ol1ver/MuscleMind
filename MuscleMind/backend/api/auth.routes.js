const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const bcrypt = require('bcrypt'); // npm install bcrypt
const requestIp = require('request-ip'); // npm install request-ip
const validateLogin = require('../middleware/login.middleware.js');
const validateRegistration = require('../middleware/registration.middleware.js');

const saltRounds = 12;

router.post('/registration', validateRegistration, async(request, response) => {
    try {
        const data = request.body;
        const ip = requestIp.getClientIp(request);
        const hashed = await bcrypt.hash(data.pass, saltRounds);
        const insert = Number(await db.registration_insert(data.firstN, data.lastN, data.userN, data.email, hashed));
        await db.log(insert, data.userN, 'registration', 'registration 1/2',ip);
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

router.post('/login', validateLogin, async(request, response)=>{
    try {
        const {email, pass} = request.body;
        const ip = requestIp.getClientIp(request);
        const user = await db.findUser(email);
        const compare = await bcrypt.compare(pass, user.password_hash);

        if(compare == false){
            await db.log(user.id, user.username,'login','Sikertelen bejelentkezés', ip);
            return response.status(401).json({
                message: 'Helytelen jelszó!'
            })
        }
        request.session.user = {
            id: user.id,
            admin: user.admin
        }
        await db.log(user.id, user.username,'login','Sikeres bejelentkezés', ip);
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

router.post('/logout',(request, response)=>{
    if(!request.session || !request.session.user){
        return response.status(401).json({
            message: "Authentication required."
        });
    }
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