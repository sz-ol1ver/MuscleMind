const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const bcrypt = require('bcrypt'); // npm install bcrypt
const requestIp = require('request-ip'); // npm install request-ip
const loginMw = require('../middleware/login.middleware.js');
const validateRegistration = require('../middleware/registration.middleware.js');

const saltRounds = 12;

router.post('/registration', validateRegistration, async(request, response) => {
    try {
        const data = request.body;
        const ip = requestIp.getClientIp(request);
        const hashed = await bcrypt.hash(data.pass, saltRounds);
        const insert = Number(await db.registration_insert(data.firstN, data.lastN, data.userN, data.email, hashed));
        await db.log(insert, 'registration', 'registration 1/2',ip);
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

router.post('/login', loginMw.validateLogin, async(request, response)=>{
    try {
        const {email, pass} = request.body;
        const ip = requestIp.getClientIp(request);
        const user = await db.findUser(email);
        const compare = await bcrypt.compare(pass, user.password_hash);

        if(compare == false){
            await db.log(user.id,'login','Sikertelen bejelentkezés', ip);
            return response.status(401).json({
                message: 'Helytelen jelszó!',
                id: 4
            })
        }
        request.session.user = {
            id: user.id,
            admin: user.admin
        }
        await db.log(user.id,'login','Sikeres bejelentkezés', ip);
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

router.get('/username', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({
            message: 'Authentication required.'
        });
    }

    try {
        const user = await db.getUsernameById(request.session.user.id)
        return response.status(200).json({
            username: user.username
        });
    } catch (error) {
        return response.status(500).json({
            message: 'Sikertelen eleres',
            error: error.message
        });
    }
});

router.get('/profile', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({
            message: 'Authentication required.'
        });
    }
    
    try {
        const id = request.session.user.id
        const basic = await db.getUserBasicData(id)
        const preferences = await db.getUserPreferencesData(id)
        const weight = await db.getUserWeightData(id)
        // console.log(basic, preferences, weight)
        
        return response.status(200).json({
            basic: basic,
            preferences: preferences,
            weight: weight,
        })
    } catch (error) {
        return response.status(500).json({
            message: 'Hiba a profil adatok eleresenel',
            error: error.message
        })
    }
});

router.post('/profile/update', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({
            message: 'Authentication required.'
        });
    }

    try {
        const ip = requestIp.getClientIp(request);
        const id = request.session.user.id
        const {
            username, first_name, last_name, email, password, 
            age, height, goal, experience_level, training_days, training_location, diet_type, meals_per_day,
            weight
        } = request.body

        const oldData = await db.getUserBasicData(id);
        const oldPasswordData = await db.getUserPassword(id);

        await db.updateUserBasic(id, username, first_name, last_name, email);
        await db.updateUserPreferences(id, age, height, goal, experience_level, training_days, training_location, diet_type, meals_per_day)
        
        if (weight) {
             await db.insertWeight(id, weight)
        }

        if (oldData.username !== username) {
            await db.log(id, 'profile_update', `Felhasználónév módosítva (${oldData.username} -> ${username})`, ip);
        }
        
        if (oldData.email !== email) {
            await db.log(id, 'profile_update', `Email módosítva (${oldData.email} -> ${email})`, ip);
        }

        if (password) {
            const isSamePassword = await bcrypt.compare(password, oldPasswordData.password_hash);
            if (!isSamePassword) {
                const hashedNewPassword = await bcrypt.hash(password, saltRounds);
                await db.updateUserPassword(id, hashedNewPassword);
                await db.log(id, 'profile_update', 'Jelszó módosítva', ip);
            }
        }

        await db.log(id, 'profile', 'Sikeres profil frissítés', ip);

        return response.status(200).json({
            message: 'Profil sikeresen frissítve!'
        })

    } catch (error) {
        return response.status(500).json({
            message: 'Hiba a profil frissítése közben',
            error: error.message
        })
    }
});

module.exports = router;