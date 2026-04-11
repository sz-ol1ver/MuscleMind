const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const requestIp = require('request-ip'); //! npm install request-ip
const loginMw = require('../middleware/login.middleware.js');
const ticketMw = require('../middleware/ticket.middleware.js');
const multer = require('multer');
const upload = multer();

router.get('/user-email', loginMw.requireAuthApi, async(request, response)=>{
    try {
        const id = request.session.user.id;
        const email = await db.findTicketEmail(id);
        return response.status(200).json({
            email: email
        });
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - tickets', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
});
router.post('/new-ticket',upload.none(),loginMw.requireAuthApi,ticketMw.validateTicket,async(request, response)=>{
    try {
        const ip = requestIp.getClientIp(request);
        const id = request.session.user.id;
        const email = await db.findTicketEmail(id);
        const {category, subject, preId, message} = request.body;

        const ticket = await db.createTicket(
            id,
            email,
            category,
            subject.trim(),
            message.trim(),
            preId ? Number(preId) : null
        )

        await db.log_id(id,'ticket_created', 'ticket id: '+ticket+', category: '+category, ip);

        return response.status(201).json({
            message: 'Sikeres kapcsolatfelvétel!'
        });
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - tickets', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})
router.get('/my-tickets', loginMw.requireAuthApi, async(request, response)=>{
    try {
        const id = request.session.user.id;
        const tickets = await db.allUserTickets(id);

        return response.status(200).json({
            tickets
        });
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - tickets', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

module.exports = router;