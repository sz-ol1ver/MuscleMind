const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip');
const {registrationComplete,validateInput} = require('../middleware/kerdoiv.middleware.js');
router.post('/', registrationComplete, validateInput, async(req, res)=>{
    try {
        const ip = requestIp.getClientIp(req);
        const id = req.session.user.id;
        const completed = await db.registComp(id);
        if(completed == 1){
        return res.redirect('/')
        }
        
        const {weight, age, height, gender, goal, experienceLevel, trainingDays, trainingLocation, dietType, mealsPerDay} = req.body;
        await db.insertPreferences(id, age, height, gender, goal, experienceLevel,trainingDays,trainingLocation,dietType,mealsPerDay);
        await db.insertWeight(id, weight);
        await db.log_id(id, 'registration', 'registration 2/2',ip);
        await db.updateRegistered(id);
        return res.status(201).json({
            message: 'Válaszok elmentve!'
        })
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(req);
        db.log_error('Server error - questionnaire', error.message,ip);
        return res.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

module.exports = router;