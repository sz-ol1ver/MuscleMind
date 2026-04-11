const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip');
const {registrationComplete,validateInput} = require('../middleware/kerdoiv.middleware.js');
router.post('/', registrationComplete, validateInput, async(request, response)=>{
    try {
        const ip = requestIp.getClientIp(request);
        const id = request.session.user.id;
        const completed = await db.registComp(id);
        if(completed == 1){
        return response.redirect('/')
        }
        
        const {weight, age, height, gender, goal, experienceLevel, trainingDays, trainingLocation, dietType, mealsPerDay} = request.body;
        await db.insertPreferences(id, age, height, gender, goal, experienceLevel,trainingDays,trainingLocation,dietType,mealsPerDay);
        await db.insertWeight(id, weight);
        await db.log_id(id, 'registration', 'registration 2/2',ip);
        await db.updateRegistered(id);
        return response.status(201).json({
            message: 'Válaszok elmentve!'
        })
    } catch (error) {
        console.error(error.message)
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - questionnaire', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

module.exports = router;