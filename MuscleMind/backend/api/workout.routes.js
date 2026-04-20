const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip');
const {requireAuthApi} = require('../middleware/login.middleware.js');
const {validateNewPlan, validateUpdate, validateActive} = require('../middleware/workout.middleware.js');

router.get('/exercises', requireAuthApi, async(request, response)=>{
    try {
        const data = await db.allExercises();
        return response.status(200).json({
            message: data
        })
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(request);
        await db.log_error('Server error - workout', error.message,ip);
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})
router.post('/newPlan', requireAuthApi, validateNewPlan, async(request, response)=>{
    const conn = await db.pool.getConnection();

    try {
        await conn.beginTransaction();

        const workoutPlan = request.body;
        const userId = request.session.user.id;
        const ip = requestIp.getClientIp(request);
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

        await db.log_id(
            userId,
            'WORKOUT_PLAN_CREATE',
            `Új edzésterv létrehozva. planId: ${planId}`,
            ip
        );

        return response.status(201).json({
            message: 'Edzésterv sikeresen létrehozva.'
        });

    } catch (error) {
        await conn.rollback();
        console.log(error.message);
        const userId = request.session.user.id;
        const ip = requestIp.getClientIp(request);
        await db.log_id(
            userId,
            'ERR_WORKOUT_PLAN_CREATE',
            `Új edzésterv sikertelen létrehozása. `+error.message,
            ip
        );
        return response.status(500).json({
            message: 'Sikertelen mentés.',
            error: error.message
        });
    } finally {
        conn.release();
    }
})

router.get('/my-plans', requireAuthApi, async(request, response)=>{
    try {
        const userId = request.session.user.id;
        const workouts = await db.allUserPlans(userId);
        return response.status(200).json({
            plans: workouts
        });
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(request);
        await db.log_error('Server error - workout', error.message,ip);
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})
router.get('/default-plans', requireAuthApi, async(request, response)=>{
    try {
        const workouts = await db.allDefaultPlans();
        return response.status(200).json({
            plans: workouts
        });
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(request);
        await db.log_error('Server error - workout', error.message,ip);
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})
router.get('/my-plan/:id', requireAuthApi, async(request, response)=>{
    try {
        const wpId = request.params.id;
        const userId = request.session.user.id;
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

        return response.status(200).json({
            details: plan
        })
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(request);
        await db.log_error('Server error - workout', error.message,ip);
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})
router.get('/default-plan/:id', requireAuthApi, async(request, response)=>{
    try {
        const wpId = request.params.id;
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

        return response.status(200).json({
            details: plan
        })
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(request);
        await db.log_error('Server error - workout', error.message,ip);
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})
router.get('/plans/active', requireAuthApi, async(request,response)=>{
    try {
        const userId = request.session.user.id;
        const activeP = await db.getActive(userId);

        return response.status(200).json({
            active: activeP
        });
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(request);
        await db.log_error('Server error - workout', error.message,ip);
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

router.put('/my-plan/update/:id', requireAuthApi, validateUpdate, async(request, response)=>{
    const conn = await db.pool.getConnection();
    
    try {
        const planId = request.params.id;
        const userId = request.session.user.id;
        const ip = requestIp.getClientIp(request);
        const days = request.body.days;

        await conn.beginTransaction();

        await db.updateWorkoutPlanDays(conn, days);

        await conn.commit();

        await db.log_id(
            userId,
            'WORKOUT_PLAN_UPDATE',
            `Edzésterv frissítve. planId: ${planId}`,
            ip
        );
        return response.status(200).json({
            message: 'Edzésterv sikeresen frissítve!'
        });

    } catch (error) {
        await conn.rollback();
        console.log(error.message);
        const userId = request.session.user.id;
        const planId = request.params.id;
        const ip = requestIp.getClientIp(request);
        await db.log_id(
            userId,
            'ERR_WORKOUT_PLAN_UPDATE',
            `Edzésterv sikertelen frissítése. planId: ${planId}`,
            ip
        );
        return response.status(500).json({
            message: 'Sikertelen frissítés!',
            error: error.message
        });
    } finally {
        conn.release();
    }
})
router.patch('/plans/active', requireAuthApi, validateActive, async(request, response)=>{
    try {
        const userId = request.session.user.id;
        const plan = request.body.active;

        if(plan === null){
            await db.updateActiveNull(userId);
        }else{
            await db.updateActive(userId, plan);
        }

        return response.status(200).json({
            message: 'Aktív edzésterv frissítve.'
        })
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(request);
        await db.log_error('Server error - workout', error.message,ip);
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

router.delete('/my-plan/delete/:id', requireAuthApi, async(request, response)=>{
    try {
        const planId = request.params.id;
        const userId = request.session.user.id;
        const ip = requestIp.getClientIp(request);

        const activeP = await db.getActive(userId);
        if(activeP == planId){
            await db.updateActiveNull(userId);
        }

        const deleted = await db.deletePlan(userId, planId);
    
        await db.log_id(
            userId,
            'WORKOUT_PLAN_DELETE',
            `Edzésterv törölve. planId: ${planId}`,
            ip
        );
        return response.status(200).json({
            message: 'Sikeres törlés!',
            row: deleted
        });
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(request);
        await db.log_error('Server error - workout', error.message,ip);
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        });
    }
})

router.get('/calendar', requireAuthApi, async (request, response) => {
    try {
        const userId = request.session.user.id
        // 2 honapra elore generalas
        await db.calendarUpToDate(userId)
        const rows = await db.getUserCalendar(userId)

        // napok csoportositasa
        const calendarMap = {}
        for (const row of rows) {
            // datum konvertalasa
            const workoutDate = new Date(row.workout_date)
            const yearStr = workoutDate.getFullYear()
            let monthStr = workoutDate.getMonth() + 1
            let dayStr = workoutDate.getDate()

            if (monthStr < 10) {
                monthStr = '0' + monthStr
            }
            if (dayStr < 10) {
                dayStr = '0' + dayStr
            }

            const dateStr = yearStr + '-' + monthStr + '-' + dayStr

            if (!calendarMap[dateStr]) {
                calendarMap[dateStr] = {
                    date: dateStr,
                    log_id: row.log_id,
                    dayName: row.day_name,
                    isRestDay: row.isRestDay,
                    status: row.status,
                    exercises: []
                }
            }

            if (row.exercise_name) {
                calendarMap[dateStr].exercises.push({
                    calendar_exercise_id: row.calendar_exercise_id,
                    name: row.exercise_name,
                    order: row.exercise_order
                })
            }
        }

        return response.status(200).json({
            calendar: Object.values(calendarMap)
        })
    } catch (error) {
        console.log(error.message)
        const ip = requestIp.getClientIp(request)
        await db.log_error('Server error - workout calendar', error.message, ip)
        return response.status(500).json({
            message: 'Sikertelen eleres!'
        })
    }
});

router.get('/calendar/sets/:exerciseId', requireAuthApi, async (request, response) => {
    try {
        const exerciseId = request.params.exerciseId
        const sets = await db.getCalendarSets(exerciseId)
        return response.status(200).json({ sets })
    } catch (error) {
        console.log(error.message)
        return response.status(500).json({ message: 'Sikertelen lekérés!' })
    }
})

router.post('/calendar/sets', requireAuthApi, async (request, response) => {
    try {
        const { calendarExerciseId, sets } = request.body
        if (!calendarExerciseId || !sets) {
            return response.status(400).json({ message: 'Hiányzó adatok!' })
        }
        await db.saveCalendarSets(calendarExerciseId, sets)
        return response.status(200).json({ message: 'Sikeres mentés!' })
    } catch (error) {
        console.log(error.message)
        return response.status(500).json({ message: 'Sikertelen mentés!' })
    }
})

router.patch('/calendar/finish/:logId', requireAuthApi, async (request, response) => {
    try {
        const logId = request.params.logId
        const userId = request.session.user.id
        
        await db.updateWorkoutCalendarLogStatus(userId, logId, 'completed')
        
        return response.status(200).json({ message: 'Edzés lezárva!' })
    } catch (error) {
        console.log(error.message)
        return response.status(500).json({ message: 'Sikertelen lezárás!' })
    }
})

module.exports = router;