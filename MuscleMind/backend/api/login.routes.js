const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const bcrypt = require('bcrypt'); // npm install bcrypt
const requestIp = require('request-ip'); // npm install request-ip
const validateLogin = require('../middleware/login.middleware.js');

router.post('/', validateLogin, (request, response)=>{
    try {
        console.log(request.body);
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