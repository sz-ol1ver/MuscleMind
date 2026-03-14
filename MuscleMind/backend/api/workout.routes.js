const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip');
const {userLoggedIn} = require('../middleware/login.middleware.js');

router.get('/exercises', userLoggedIn, async(req, res)=>{
    try {
        const data = await db.allExercises();
        return res.status(200).json({
            message: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Sikertelen elérés!',
            error: error.message
        })
    }
})

module.exports = router;