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
        console.log(error.message)
        const ip = requestIp.getClientIp(request);
        await db.log_error('Server error - ticket', error.message, ip);
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
});
router.post('/new-ticket',upload.none(),loginMw.requireAuthApi,ticketMw.validateTicket,async(request, response)=>{
    try {
        console.log(request.body);
        return response.status(200).json({
            message: 'sikeres post'
        });
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(request);
        await db.log_error('Server error - ticket', error.message, ip);
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

module.exports = router;