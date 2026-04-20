const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip'); //! npm install request-ip
const loginMw = require('../middleware/login.middleware.js');
const {requireAdmin} = require('../middleware/isAdmin.middleware.js')
const multer = require('multer');
const upload = multer();

//?dashboard
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

//? tickets
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
        const id = request.session.user.id;
        const ip = requestIp.getClientIp(request);
        await db.log_id(id, 'admin - ticket status', 'new ticket status: seen, ticket id: '+ticketId, ip);
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
        const id = request.session.user.id;
        const ip = requestIp.getClientIp(request);
        await db.log_id(id, 'admin - ticket status', 'new ticket status: seen, all ticket', ip);
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
        const admin_rep = await db.ticketAdminReplyCheck(ticketId);
        let closeTicket;
        const id = request.session.user.id;
        const ip = requestIp.getClientIp(request);
        if(!admin_rep){
            closeTicket = await db.ticketClose(ticketId, 'closed_no_reply');
            await db.log_id(id, 'admin - ticket status', 'new ticket status: closed_no_reply, ticket id: '+ticketId, ip);
        }else{
            closeTicket = await db.ticketClose(ticketId, 'closed');
            await db.log_id(id, 'admin - ticket status', 'new ticket status: closed, ticket id: '+ticketId, ip);
        }
        
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
router.patch('/ticket-answer/:id', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
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
        const ip = requestIp.getClientIp(request);
        await db.log_id(adminId, 'admin - ticket admin reply', 'ticket id: '+ticketId+', admin id: '+adminId, ip);
        return response.status(200).json({
            message: 'Válasz sikeresen mentve!',
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

//? users
router.get('/all-user', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const users = await db.allUserBasicData();
        return response.status(200).json({
            users
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
router.get('/user/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const user = await db.userAllData(id);
        return response.status(200).json({
            user
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
router.patch('/user/toggle-admin/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const adminId = request.session.user.id;
        if(id == adminId){
            return response.status(403).json({
                message: 'Sikeertelen admin jogosultság frissítés!'
            });
        }
        const admin = await db.userAdmin(id);
        return response.status(200).json({
            message: 'Sikeres admin jogosultság frissítés!',
            admin
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
router.patch('/user/block/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const adminId = request.session.user.id;
        if(id == adminId){
            return response.status(403).json({
                message: 'Sikertelen fiók tiltás!'
            });
        }
        const block = await db.userBlock(id);
        return response.status(200).json({
            message: 'Sikeres fiók tiltás!',
            block
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
router.patch('/user/unblock/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const unblock = await db.userUnblock(id);
        return response.status(200).json({
            message: 'Sikeres fiók feloldás!',
            unblock
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
router.delete('user/delete/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const adminId = request.session.user.id;
        if(id == adminId){
            return response.status(403).json({
                message: 'Sikertelen fiók törlés!'
            });
        }
        const deleteUser = await db.userDelete(id);
        return response.status(200).json({
            message: 'Sikeres fiók törlés!',
            deleteUser
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
})


module.exports = router;