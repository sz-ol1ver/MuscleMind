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
});

router.get('/all-tickets', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
    try {
        const tickets = await db.allTickets();
        return response.status(200).json({
            tickets
        });
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
});
router.patch('/ticket-seen/:id', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
    try {
        const ticketId = request.params.id;
        const valid = await db.validateTicketId(ticketId);
        if(valid != 1){
            return response.status(404).json({
                message: 'Ticket nem található!'
            });
        }
        const seenTicket = await db.ticketSeen(ticketId);
        return response.status(200).json({
            message: 'Sikeres státusz frissítés!',
            affectedRows: seenTicket
        });
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
});
router.patch('/all-tickets/seen', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
    try {
        const seenTickets = await db.ticketsSeen();
        return response.status(200).json({
            message: 'Sikeres státusz frissítés!',
            affectedRows: seenTickets
        });
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
});
router.patch('/ticket-close/:id', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
    try {
        const ticketId = request.params.id;
        const valid = await db.validateTicketId(ticketId);
        if(valid != 1){
            return response.status(404).json({
                message: 'Ticket nem található!'
            });
        }
        const closeTicket = await db.ticketClose(ticketId);
        return response.status(200).json({
            message: 'Sikeres státusz frissítés!',
            affectedRows: closeTicket
        });
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
});
router.patch('/ticket-close-answer/:id', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
    try {
        const ticketId = request.params.id;
        const valid = await db.validateTicketId(ticketId);
        if(valid != 1){
            return response.status(404).json({
                message: 'Ticket nem található!'
            });
        }
        const {admin_reply} = request.body;
        if (!admin_reply || admin_reply.trim() === '') {
            return response.status(400).json({
                message: 'Admin válasz üres!'
            });
        }
        const adminId = request.session.user.id;
        const ansTicket = await db.ticketAnswer(ticketId, admin_reply, adminId);
        return response.status(200).json({
            message: 'Sikeres válasz mentés & státusz frissítés!',
            affectedRows: ansTicket
        });
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
});

module.exports = router;