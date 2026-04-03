const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip');
const {requireAuthApi} = require('../middleware/login.middleware.js');
const {validateNewPlan, validateUpdate, validateActive} = require('../middleware/workout.middleware.js');

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
                day.name.trim(),
                day.restDay
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
        const userId = req.session.user.id;
        const ip = requestIp.getClientIp(req);
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
router.get('/default-plans', requireAuthApi, async(req, res)=>{
    try {
        const workouts = await db.allDefaultPlans();
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
router.get('/my-plan/:id', requireAuthApi, async(req, res)=>{
    try {
        const wpId = req.params.id;
        const userId = req.session.user.id;
        const wpDetail = await db.getWorkoutPlanDetails(userId, wpId);
        const plan = {
            name: wpDetail[0].plan_name,
            days_count: wpDetail[0].days_count,
            days: []
        };
        let currentDay = null;
        for(const row of wpDetail){
            // ha még nincs létrehozva ez a nap
            if (!currentDay || currentDay.dayId !== row.day_id) {
                currentDay = {
                    dayId: row.day_id,
                    dayNumber: row.day_number,
                    name: row.day_name,
                    restDay: row.isRestDay,
                    url: row.image_url,
                    exercises: []
                };

                plan.days.push(currentDay);
            }

            if (row.exercise_id && !row.isRestDay) {
                currentDay.exercises.push({
                    exerciseId: row.exercise_id,
                    name: row.exercise_name,
                    order: row.exercise_order
                });
            }
        }

        return res.status(200).json({
            details: plan
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Sikertelen elérés!',
            error: error.message
        });
    }
})
router.get('/default-plan/:id', requireAuthApi, async(req, res)=>{
    try {
        const wpId = req.params.id;
        const wpDetail = await db.getDefaultWorkoutPlanDetails(wpId);
        const plan = {
            name: wpDetail[0].plan_name,
            days_count: wpDetail[0].days_count,
            level: wpDetail[0].level,
            location: wpDetail[0].location,
            goal: wpDetail[0].goal,
            description: wpDetail[0].description,
            active: wpDetail[0].is_active,
            days: []
        };
        let currentDay = null;
        for(const row of wpDetail){
            // ha még nincs létrehozva ez a nap
            if (!currentDay || currentDay.dayId !== row.day_id) {
                currentDay = {
                    dayId: row.day_id,
                    dayNumber: row.day_number,
                    name: row.day_name,
                    restDay: row.isRestDay,
                    url: row.image_url,
                    exercises: []
                };

                plan.days.push(currentDay);
            }

            if (row.exercise_id && !row.isRestDay) {
                currentDay.exercises.push({
                    exerciseId: row.exercise_id,
                    name: row.exercise_name,
                    order: row.exercise_order
                });
            }
        }

        return res.status(200).json({
            details: plan
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Sikertelen elérés!',
            error: error.message
        });
    }
})
router.get('/plans/active', requireAuthApi, async(req,res)=>{
    try {
        const userId = req.session.user.id;
        const activeP = await db.getActive(userId);

        return res.status(200).json({
            active: activeP
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Sikertelen elérés!',
            error: error.message
        });
    }
})

router.put('/my-plan/update/:id', requireAuthApi, validateUpdate, async(req, res)=>{
    const conn = await db.pool.getConnection();
    
    try {
        const planId = req.params.id;
        const userId = req.session.user.id;
        const ip = requestIp.getClientIp(req);
        const days = req.body.days;

        await conn.beginTransaction();

        await db.updateWorkoutPlanDays(conn, days);

        await conn.commit();

        await db.log(
            userId,
            'WORKOUT_PLAN_UPDATE',
            `Edzésterv frissítve. planId: ${planId}`,
            ip
        );
        return res.status(200).json({
            message: 'Edzésterv sikeresen frissítve!'
        });

    } catch (error) {
        await conn.rollback();
        console.log(error.message);
        const userId = req.session.user.id;
        const planId = req.params.id;
        const ip = requestIp.getClientIp(req);
        await db.log(
            userId,
            'ERR_WORKOUT_PLAN_UPDATE',
            `Edzésterv sikertelen frissítése. planId: ${planId}`,
            ip
        );
        return res.status(500).json({
            message: 'Sikertelen frissítés!',
            error: error.message
        });
    } finally {
        conn.release();
    }
})
router.patch('/plans/active', requireAuthApi, validateActive, async(req, res)=>{
    try {
        const userId = req.session.user.id;
        const plan = req.body.active;
        await db.updateActive(userId, plan);

        return res.status(200).json({
            message: 'Aktív edzésterv frissítve.'
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Sikertelen elérés!',
            error: error.message
        });
    }
})

router.delete('/my-plan/delete/:id', requireAuthApi, async(req, res)=>{
    try {
        const planId = req.params.id;
        const userId = req.session.user.id;
        const ip = requestIp.getClientIp(req);

        const deleted = await db.deletePlan(userId, planId);
    
        await db.log(
            userId,
            'WORKOUT_PLAN_DELETE',
            `Edzésterv törölve. planId: ${planId}`,
            ip
        );
        return res.status(200).json({
            message: 'Sikeres törlés!',
            row: deleted
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