const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip'); //! npm install request-ip
const loginMw = require('../middleware/login.middleware.js');
const multer = require('multer');
const upload = multer();

router.get('/me', loginMw.requireAuthApi, async(request, response) => {
    try {
        const userId = request.session.user.id;

        const globalXp = await db.getUserGlobalXp(userId);
        const muscleXp = await db.getUserMuscleXp(userId);
        const last30DaysStats = await db.getUserDailyStatsLast30Days(userId);
        const fullStats = await db.getUserFullStats(userId);
        const prs = await db.getUserExercisePrs(userId);
        const weights = await db.getUserWeights(userId);
        const exercises = await db.getAllExercisesForStats();
        const metrics = await db.getUserMetrics(userId);

        return response.status(200).json({
            stats: {
                globalXp,
                muscleXp,
                last30DaysStats,
                fullStats,
                prs,
                weights,
                metrics
            },
            exercises
        });

    } catch (error) {
        console.error(error.message);

        const ip = requestIp.getClientIp(request);

        try {
            await db.log_error('Server error - stats', error.message, ip);
        } catch (error) {
            console.error('Logging failed:', error);
        }

        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
});



module.exports = router;

