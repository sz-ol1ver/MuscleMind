const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const bcrypt = require('bcrypt'); // npm install bcrypt
const requestIp = require('request-ip'); // npm install request-ip
const validateLogin = require('../middleware/login.middleware.js');

router.post('/', validateLogin, async(request, response)=>{
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
            role: user.admin
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

module.exports = router;