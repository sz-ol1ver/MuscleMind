const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const requestIp = require('request-ip'); // npm install request-ip
const bcrypt = require('bcrypt'); // npm install bcrypt
const { requireAuthApi } = require('../middleware/login.middleware.js')
const { validateProfileUpdate } = require('../middleware/profile.middleware.js')

const saltRounds = 12;

router.use(requireAuthApi)

router.get('/', async (request, response) => {
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
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - profile', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

router.post('/update', validateProfileUpdate, async (request, response) => {
    try {
        const ip = requestIp.getClientIp(request)
        const id = request.session.user.id
        const mergedData = request.mergedProfileData
        const oldBasic = request.oldProfileBasicData
        const oldPasswordData = await db.getUserPassword(id)

        await db.updateUserBasic(
            id, 
            mergedData.username, 
            mergedData.first_name, 
            mergedData.last_name, 
            mergedData.email
        )

        await db.updateUserPreferences(
            id, 
            mergedData.birth_date, 
            mergedData.height, 
            mergedData.goal, 
            mergedData.experience_level, 
            mergedData.training_days, 
            mergedData.training_location, 
            mergedData.diet_type, 
            mergedData.meals_per_day
        )
        
        if (mergedData.weight) {
             await db.insertWeight(id, mergedData.weight)
        }

        if (oldBasic.username !== mergedData.username) {
            await db.log_id(id, 'profile_update', `Felhasználónév módosítva (${oldBasic.username} -> ${mergedData.username})`, ip)
        }
        
        if (oldBasic.email !== mergedData.email) {
            await db.log_id(id, 'profile_update', `Email módosítva (${oldBasic.email} -> ${mergedData.email})`, ip)
        }

        if (mergedData.password) {
            const isSamePassword = await bcrypt.compare(mergedData.password, oldPasswordData.password_hash)
            if (!isSamePassword) {
                const hashedNewPassword = await bcrypt.hash(mergedData.password, saltRounds)
                await db.updateUserPassword(id, hashedNewPassword)
                await db.log_id(id, 'profile_update', 'Jelszó módosítva', ip)
            }
        }

        await db.log_id(id, 'profile', 'Sikeres profil frissítés', ip)

        return response.status(200).json({
            message: 'Profil sikeresen frissítve!'
        })

    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - profile', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

router.get('/username', async (request, response) => {
    try {
        const user = await db.getUsernameById(request.session.user.id)
        return response.status(200).json({
            username: user.username
        })
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - profile', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

module.exports = router