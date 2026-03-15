const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip');
const {requireAuthApi} = require('../middleware/login.middleware.js');
const {validateNewPlan} = require('../middleware/workout.middleware.js');

router.get('/exercises', requireAuthApi, async(req, res)=>{
    try {
        const data = await db.allExercises();
        return res.status(200).json({
            message: data
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Sikertelen elérés!',
            error: error.message
        })
    }
})
router.post('/newPlan', requireAuthApi, validateNewPlan, async(req, res)=>{
    try {
        console.log(req.body);

        res.status(200).json({
            message: 'saved!'
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Sikertelen mentés',
            error: error.message
        })
    }
})

module.exports = router;