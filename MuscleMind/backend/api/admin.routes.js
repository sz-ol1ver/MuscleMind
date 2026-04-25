const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip'); //! npm install request-ip
const loginMw = require('../middleware/login.middleware.js');
const foodsMw = require('../middleware/foods.middleware.js');
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
router.get('/tickets/all', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
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
router.patch('/ticket/seen/:id', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
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
router.patch('/tickets/all/seen', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
    try {
        const seenTickets = await db.ticketsSeen();
        const id = request.session.user.id;
        const ip = requestIp.getClientIp(request);
        await db.log_id(id, 'admin - ticket status', 'all tickets marked as seen, affected rows: ' + seenTickets, ip);
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
router.patch('/ticket/close/:id', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
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
router.patch('/ticket/answer/:id', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
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
router.get('/users/all', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
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
        const {adminStatus} = request.body;
        if (adminStatus !== 0 && adminStatus !== 1) {
            return response.status(400).json({
                message: 'Sikertelen fiók állapot frissítés!'
            });
        }
        if(id == adminId){
            return response.status(403).json({
                message: 'Sikertelen admin jogosultság frissítés!'
            });
        }
        const admin = await db.userAdmin(id);
        const ip = requestIp.getClientIp(request);
        if(adminStatus == 0){
            await db.log_id(
                adminId, 'admin - user role change', 'target user id: ' + id + ', old admin: 0, new admin: 1', ip
            );
            return response.status(200).json({
                message: 'Felhasználó adminná téve.',
                admin
            });
        }else if(adminStatus == 1){
            await db.log_id(
                adminId, 'admin - user role change', 'target user id: ' + id + ', old admin: 1, new admin: 0', ip
            );
            return response.status(200).json({
                message: 'Admin jog elvéve.',
                admin
            });
        }
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
router.patch('/user/toggle-block/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const adminId = request.session.user.id;
        const {active} = request.body;
        if (active !== 0 && active !== 1) {
            return response.status(400).json({
                message: 'Sikertelen fiók állapot frissítés!'
            });
        }
        if(id == adminId){
            return response.status(403).json({
                message: 'Sikertelen fiók állapot frissítés!'
            });
        }
        const block = await db.userBlock(id);
        const ip = requestIp.getClientIp(request);
        if(active == 0){
            await db.log_id(
                adminId,
                'admin - user active change',
                'target user id: ' + id + ', old active: 0, new active: 1',
                ip
            );
            return response.status(200).json({
                message: 'Sikeres fiók feloldás!',
                block
            });
        }else if(active == 1){
            await db.log_id(
                adminId,
                'admin - user active change',
                'target user id: ' + id + ', old active: 1, new active: 0',
                ip
            );
            return response.status(200).json({
                message: 'Sikeres fiók tiltás!',
                block
            });
        }
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
router.patch('/user/email/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const {new_email} = request.body;
        const patternEmail = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)?@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/;
        if (!new_email) {
            return response.status(400).json({
                message: 'E-mail cím kötelező.'
            });
        }
        if (!patternEmail.test(new_email)) {
            return response.status(400).json({
                message: 'Érvénytelen email formátum.'
            });
        }
        const emailExist = await db.email_exist(new_email);
        if(emailExist == 1){
            return response.status(403).json({
                message: 'Már regisztrált e-mail cím!'
            });
        }
        const email = await db.userChangeEmail(id, new_email);
        const adminId = request.session.user.id;
        const ip = requestIp.getClientIp(request);
        await db.log_id(
            adminId,
            'admin - user email change',
            'target user id: ' + id + ', new email: ' + new_email.trim(),
            ip
        );
        return response.status(200).json({
            message: 'Sikeres email változtatás!',
            email
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
router.patch('/user/username/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const {new_username} = request.body;
        const patternUser = /^[a-z0-9]{3,20}$/;
        if (!new_username) {
            return response.status(400).json({
                message: 'Felhasználónév kötelező.'
            });
        }
        if (!patternUser.test(new_username)) {
            return response.status(400).json({
                message: 'A felhasználónév csak kisbetűket és számokat tartalmazhat (3-20 karakter).'
            });
        }
        const usernameExist = await db.username_exist(new_username);
        if(usernameExist == 1){
            return response.status(403).json({
                message: 'Már regisztrált felhasználónév!'
            });
        }
        const username = await db.userChangeUsername(id, new_username);
        const adminId = request.session.user.id;
        const ip = requestIp.getClientIp(request);
        await db.log_id(
            adminId,
            'admin - user username change',
            'target user id: ' + id + ', new username: ' + new_username.trim(),
            ip
        );
        return response.status(200).json({
            message: 'Sikeres felhasználónév változtatás!',
            username
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
router.delete('/user/delete/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const adminId = request.session.user.id;
        if(id == adminId){
            return response.status(403).json({
                message: 'Sikertelen fiók törlés!'
            });
        }
        const deleteUser = await db.userDelete(id);
        const ip = requestIp.getClientIp(request);
        await db.log_id(
            adminId,
            'admin - user delete',
            'deleted user id: ' + id,
            ip
        );
        
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
});
//? Foods
router.post('/foods/new', upload.none(),loginMw.requireAuthApi, requireAdmin,foodsMw.validateNewFood,async(request, response) =>{
    try {
        const adminId = request.session.user.id;
        const food = request.body;
        const foodId = await db.createFood(adminId,food)
        for(let allergen of food.allergens){
            await db.insertFoodAllergen(foodId,allergen);
        }
        const ip = requestIp.getClientIp(request);
        await db.log_id(
            adminId,
            'admin - food create',
            'created food id: ' + foodId + ' | name: ' + food.name,
            ip
        );
        return response.status(200).json({
            message: 'Sikeres hozzáadás'
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
router.get('/foods/all', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
    try {
        const foods = await db.allFoods();
        return response.status(200).json({
            foods
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
router.patch('/foods/toggle-approved/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const adminId = request.session.user.id;
        const {is_approved} = request.body;

        if (is_approved !== true && is_approved !== false && is_approved !== 1 && is_approved !== 0) {
            return response.status(400).json({
                message: 'Sikertelen jóváhagyás frissítés!'
            });
        }

        const approved = await db.foodApproved(id);
        const ip = requestIp.getClientIp(request);

        if(is_approved == 0 || is_approved === false){
            await db.log_id(
                adminId,
                'admin - food approval change',
                'food id: ' + id + ', old approved: 0, new approved: 1',
                ip
            );
            return response.status(200).json({
                message: 'Étel sikeresen jóváhagyva!',
                approved
            });
        }else if(is_approved == 1 || is_approved === true){
            await db.log_id(
                adminId,
                'admin - food approval change',
                'food id: ' + id + ', old approved: 1, new approved: 0',
                ip
            );
            return response.status(200).json({
                message: 'Étel jóváhagyása visszavonva!',
                approved
            });
        }
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
router.delete('/foods/delete-food/:id', loginMw.requireAuthApi, requireAdmin, async(request,response)=>{
    try {
        const id = request.params.id;
        const adminId = request.session.user.id;

        const deletedFood = await db.deleteFood(id);
        const ip = requestIp.getClientIp(request);

        await db.log_id(
            adminId,
            'admin - food delete',
            'deleted food id: ' + id,
            ip
        );

        return response.status(200).json({
            message: 'Étel sikeresen törölve!',
            deletedFood
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
//? workouts
router.get('/workouts/all', loginMw.requireAuthApi, requireAdmin, async(request, response) =>{
    try {
        const defWorkouts = await db.getAllDefaultPlans();
        const userWorkouts = await db.getAllUsersPlans();
        return response.status(200).json({
            default: defWorkouts,
            users: userWorkouts
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
router.post('/workout/new',upload.none(), loginMw.requireAuthApi, requireAdmin,async(request,response)=> {
    try {
        return response.status(200).json({
            message: 'Sikeres edzésterv létrehozás!'
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
router.put('/workout/edit/:id', upload.none(),loginMw.requireAuthApi, requireAdmin,async(request,response)=> {
    try {
        return response.status(200).json({
            message: 'Sikeres edzésterv frissítés!'
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