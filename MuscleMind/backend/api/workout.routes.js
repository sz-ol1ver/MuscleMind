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
    const conn = await db.pool.getConnection();

    try {
        await conn.beginTransaction();

        const workoutPlan = req.body;
        const userId = req.session.user.id;
        const ip = requestIp.getClientIp(req);
        const planId = await db.createWorkoutPlan(
            conn,
            userId,
            workoutPlan.name.trim(),
            workoutPlan.days.length
        );
        for (let i = 0; i < workoutPlan.days.length; i++) {
            const day = workoutPlan.days[i];
            const dayId = await db.createWorkoutDay(
                conn,
                planId,
                day.dayNumber,
                day.name.trim()
            );
            if (!day.restDay) {
                for (let j = 0; j < day.exercises.length; j++) {
                    const exercise = day.exercises[j];
                    await db.createDayExercise(
                        conn,
                        dayId,
                        exercise.exerciseId,
                        exercise.order
                    );
                }
            }
        }

        await conn.commit();

        await db.log(
            userId,
            'WORKOUT_PLAN_CREATE',
            `Új edzésterv létrehozva. planId: ${planId}`,
            ip
        );

        return res.status(201).json({
            message: 'Edzésterv sikeresen létrehozva.'
        });

    } catch (error) {
        await conn.rollback();
        console.log(error.message);
        await db.log(
            userId,
            'ERR_WORKOUT_PLAN_CREATE',
            `Új edzésterv sikertelen létrehozása. `+error.message,
            ip
        );
        return res.status(500).json({
            message: 'Sikertelen mentés.',
            error: error.message
        });
    } finally {
        conn.release();
    }
})

router.get('/my-plans', requireAuthApi, async(req, res)=>{
    try {
        const userId = req.session.user.id;
        const workouts = await db.allUserPlans(userId);
        return res.status(200).json({
            plans: workouts
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Sikertelen elérés!',
            error: error.message
        });
    }
})

module.exports = router;