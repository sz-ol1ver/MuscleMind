const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip'); //! npm install request-ip
const loginMw = require('../middleware/login.middleware.js');
const {requireAdmin} = require('../middleware/isAdmin.middleware.js')
const multer = require('multer');
const upload = multer();

router.get('/dashboard', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        let dashStats = {
            allUser: await db.totalUserCount(), //? osszes regisztralt felhasznalo db szam
            todayReg: await db.todayRegistration(), //? osszes regisztracio ma db szam
            todayLog: await db.todayLoginCount(), //? osszes aktiv user ma db szam
            todayTicket: await db.todayTicketCount(), //? osszes ma nyitott ticket db szan
            todayError: await db.todayErrorCount(), //? osszes mai szerver error db szam
            todayWorkout: await db.todayWorkoutCount() //? osszes ma keszitett edzesterv db szam
        };
        return response.status(200).json({
            dashStats
        })
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - admin', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

module.exports = router;