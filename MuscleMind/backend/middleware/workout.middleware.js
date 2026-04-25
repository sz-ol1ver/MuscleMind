const db = require('../sql/database.js');

async function validateNewPlan(req,res, next) {
    try {
        const workoutPlan = req.body;
        const allowedPlan = ['name', 'days'];
        const allowedDay = ['dayNumber', 'name', 'restDay', 'exercises'];
        const allowedExercise = ['exerciseId', 'name', 'order'];
        if (!workoutPlan || typeof workoutPlan !== 'object' || Array.isArray(workoutPlan)) {
            return res.status(400).json({
                message: 'Nem sikerült feldolgozni az edzésterv adatait.'
            });
        }
        const keysPlan = Object.keys(workoutPlan);
        if(keysPlan.length !== allowedPlan.length){
            return res.status(400).json({
                message: 'Nem sikerült feldolgozni az edzésterv adatait.'
            });
        }
        for(let i = 0; i<keysPlan.length; i++){
            if(!allowedPlan.includes(keysPlan[i])){
                return res.status(400).json({
                message: 'Nem sikerült feldolgozni az edzésterv adatait.'
            });
            }
        }
        if (!workoutPlan.name || typeof workoutPlan.name !== 'string' || !workoutPlan.name.trim() || workoutPlan.name.length > 100) 
        {
            return res.status(400).json({
                message: 'Adj nevet az edzéstervnek.'
            });
        }
        if (!Array.isArray(workoutPlan.days)) {
            return res.status(400).json({
                message: 'Nem sikerült feldolgozni az edzésnapokat.'
            });
        }
        if (workoutPlan.days.length < 1) {
            return res.status(400).json({
                message: 'Adj hozzá legalább 1 napot az edzéstervhez.'
            });
        }else if(workoutPlan.days.length > 7) {
            return res.status(400).json({
                message: 'Legfeljebb 7 napos edzéstervet hozhatsz létre.'
            });
        }
        let napokSzama = [];
        for(let i = 0; i<workoutPlan.days.length; i++){
            const day = workoutPlan.days[i];
            if (!day || typeof day !== 'object' || Array.isArray(day)){
                return res.status(400).json({
                    message: 'Napok adatainak feldolgozása sikertelen!'
                });
            }
            const keysDay = Object.keys(day);
            if(keysDay.length !== allowedDay.length){
                return res.status(400).json({
                    message: 'Nem sikerült feldolgozni az edzésterv adatait.'
                });
            }
            for(let i = 0; i<keysDay.length; i++){
                if(!allowedDay.includes(keysDay[i])){
                    return res.status(400).json({
                    message: 'Nem sikerült feldolgozni az edzésterv adatait.'
                });
                }
            }
            if(!Number.isInteger(day.dayNumber) || day.dayNumber < 1 || day.dayNumber > 7 || napokSzama.includes(day.dayNumber)){
                return res.status(400).json({
                    message: 'Napok adatainak feldolgozása sikertelen!'
                });
            }
            napokSzama.push(day.dayNumber);
            if(typeof day.name !== 'string' || !day.name.trim()){
                return res.status(400).json({
                    message: 'Adj nevet a napnak!'
                });
            }
            if(typeof day.restDay !== 'boolean'){
                return res.status(400).json({
                    message: 'Napok adatainak feldolgozása sikertelen!'
                });
            }
            if(!Array.isArray(day.exercises)){
                return res.status(400).json({
                    message: i+1 +'. nap hiányos!'
                });
            }
            if(day.exercises.length < 1 && day.restDay == false){
                return res.status(400).json({
                    message: i+1 +'. nap hiányos!'
                });
            }
            if (day.restDay && day.exercises.length != 1) {
                return res.status(400).json({
                    message: 'Ütközés: pihenőnap + gyakorlat nem lehet!'
                });
            }
            const exercises = day.exercises;
            let gyakId = [];
            let order = [];
            for(let j = 0; j<exercises.length; j++){
                const exercise = exercises[j];
                if (!exercise || typeof exercise !== 'object' || Array.isArray(exercise)) {
                    return res.status(400).json({
                        message: 'Gyakorlatok feldolgozása sikertelen!'
                    });
                }
                const keysExercise = Object.keys(exercise);
                if(keysExercise.length !== allowedExercise.length){
                    return res.status(400).json({
                        message: 'Nem sikerült feldolgozni az edzésterv adatait.'
                    });
                }
                for(let i = 0; i<keysExercise.length; i++){
                    if(!allowedExercise.includes(keysExercise[i])){
                        return res.status(400).json({
                        message: 'Nem sikerült feldolgozni az edzésterv adatait.'
                    });
                    }
                }
                if(typeof exercise.name !== 'string' || typeof exercise.exerciseId !== 'number' || exercise.exerciseId < 0 || !exercise.name.trim()){
                    return res.status(400).json({
                        message: 'Gyakorlatok feldolgozása sikertelen!'
                    });
                }
                if(exercise.exerciseId != 0){
                    if(!Number.isInteger(exercise.order) || exercise.order < 1){
                        return res.status(400).json({
                            message: 'Gyakorlatok feldolgozása sikertelen!'
                        });
                    }
                }else if(exercise.exerciseId == 0){
                    if(exercise.order != null){
                        return res.status(400).json({
                            message: 'Gyakorlatok feldolgozása sikertelen!'
                        });
                    }
                }
                if(order.includes(exercise.order)){
                    return res.status(400).json({
                        message: 'Duplikáció a gyakorlatok között!'
                    });
                }
                if(gyakId.includes(exercise.exerciseId)){
                    return res.status(400).json({
                        message: 'Duplikáció a gyakorlatok között!'
                    });
                }
                order.push(exercise.order);
                gyakId.push(exercise.exerciseId);
            }
            for(let a = 0; a < gyakId.length; a++){
                if(gyakId[a] == 0){
                    continue;
                }

                const exist = await db.exerciseExist(Number(gyakId[a]));
                if(!exist){
                    return res.status(400).json({
                        message: 'Nem létező gyakorlat! (' + (i + 1) + '. nap)'
                    });
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}
async function validateUpdate(req,res,next) {
    try {
        const userId = req.session.user.id;
        const planId = req.params.id;
        const workoutPlan = req.body;
        const allowedPlan = ['name', 'days_count', 'days'];
        const allowedDay = ['dayId','dayNumber', 'name', 'restDay', 'exercises', 'url'];
        const allowedExercise = ['exerciseId', 'name', 'order'];
        console.log(workoutPlan);
        if (!workoutPlan || typeof workoutPlan !== 'object' || Array.isArray(workoutPlan)) {
            return res.status(400).json({
                message: 'Nem sikerült feldolgozni az edzésterv adatait.1'
            });
        }
        const keysPlan = Object.keys(workoutPlan);
        if(keysPlan.length !== allowedPlan.length){
            return res.status(400).json({
                message: 'Nem sikerült feldolgozni az edzésterv adatait.2'
            });
        }
        for(let i = 0; i<keysPlan.length; i++){
            if(!allowedPlan.includes(keysPlan[i])){
                return res.status(400).json({
                message: 'Nem sikerült feldolgozni az edzésterv adatait.3'
            });
            }
        }
        if (!workoutPlan.name || typeof workoutPlan.name !== 'string' || !workoutPlan.name.trim()) 
        {
            return res.status(400).json({
                message: 'Adj nevet az edzéstervnek.'
            });
        }
        if (!Array.isArray(workoutPlan.days)) {
            return res.status(400).json({
                message: 'Nem sikerült feldolgozni az edzésnapokat.'
            });
        }
        if (workoutPlan.days.length < 1) {
            return res.status(400).json({
                message: 'Adj hozzá legalább 1 napot az edzéstervhez.'
            });
        }else if(workoutPlan.days.length > 7) {
            return res.status(400).json({
                message: 'Legfeljebb 7 napos edzéstervet hozhatsz létre.'
            });
        }
        let napokSzama = [];
        for(let i = 0; i<workoutPlan.days.length; i++){
            const day = workoutPlan.days[i];
            if (!day || typeof day !== 'object' || Array.isArray(day)){
                return res.status(400).json({
                    message: 'Napok adatainak feldolgozása sikertelen!1'
                });
            }
            const keysDay = Object.keys(day);
            if(keysDay.length !== allowedDay.length){
                return res.status(400).json({
                    message: 'Nem sikerült feldolgozni az edzésterv adatait.4'
                });
            }
            for(let i = 0; i<keysDay.length; i++){
                if(!allowedDay.includes(keysDay[i])){
                    return res.status(400).json({
                    message: 'Nem sikerült feldolgozni az edzésterv adatait.5'
                });
                }
            }
            if(!Number.isInteger(day.dayNumber) || day.dayNumber < 1 || day.dayNumber > 7 || napokSzama.includes(day.dayNumber)){
                return res.status(400).json({
                    message: 'Napok adatainak feldolgozása sikertelen!2'
                });
            }
            napokSzama.push(day.dayNumber);
            if(typeof day.name !== 'string' || !day.name.trim()){
                return res.status(400).json({
                    message: 'Adj nevet a napnak!'
                });
            }
            if(typeof day.restDay !== 'boolean'){
                return res.status(400).json({
                    message: 'Napok adatainak feldolgozása sikertelen!3'
                });
            }
            if(!Array.isArray(day.exercises)){
                return res.status(400).json({
                    message: i+1 +'. nap hiányos!'
                });
            }
            if(day.exercises.length < 1 && day.restDay == false){
                return res.status(400).json({
                    message: i+1 +'. nap hiányos!'
                });
            }
            if (day.restDay && day.exercises.length != 1) {
                return res.status(400).json({
                    message: 'Ütközés: pihenőnap + gyakorlat nem lehet!'
                });
            }
            const exercises = day.exercises;
            let gyakId = [];
            let order = [];
            for(let j = 0; j<exercises.length; j++){
                const exercise = exercises[j];
                if (!exercise || typeof exercise !== 'object' || Array.isArray(exercise)) {
                    return res.status(400).json({
                        message: 'Gyakorlatok feldolgozása sikertelen!'
                    });
                }
                const keysExercise = Object.keys(exercise);
                if(keysExercise.length !== allowedExercise.length){
                    return res.status(400).json({
                        message: 'Nem sikerült feldolgozni az edzésterv adatait.6'
                    });
                }
                for(let i = 0; i<keysExercise.length; i++){
                    if(!allowedExercise.includes(keysExercise[i])){
                        return res.status(400).json({
                        message: 'Nem sikerült feldolgozni az edzésterv adatait.7'
                    });
                    }
                }
                if(typeof exercise.name !== 'string' || typeof exercise.exerciseId !== 'number' || exercise.exerciseId < 0 || !exercise.name.trim()){
                    return res.status(400).json({
                        message: 'Gyakorlatok feldolgozása sikertelen!'
                    });
                }
                if(exercise.exerciseId != 0){
                    if(!Number.isInteger(exercise.order) || exercise.order < 1){
                        return res.status(400).json({
                            message: 'Gyakorlatok feldolgozása sikertelen!'
                        });
                    }
                }else if(exercise.exerciseId == 0){
                    if(exercise.order != null){
                        return res.status(400).json({
                            message: 'Gyakorlatok feldolgozása sikertelen!'
                        });
                    }
                }
                if(order.includes(exercise.order)){
                    return res.status(400).json({
                        message: 'Duplikáció a gyakorlatok között!'
                    });
                }
                if(gyakId.includes(exercise.exerciseId)){
                    return res.status(400).json({
                        message: 'Duplikáció a gyakorlatok között!'
                    });
                }
                order.push(exercise.order);
                gyakId.push(exercise.exerciseId);
            }
            for(let a = 0; a < gyakId.length; a++){
                if(gyakId[a] == 0){
                    continue;
                }

                const exist = await db.exerciseExist(Number(gyakId[a]));
                if(!exist){
                    return res.status(400).json({
                        message: 'Nem létező gyakorlat! (' + (i + 1) + '. nap)'
                    });
                }
            }
        }
        const valid = await db.selectUpdatePlan(userId, planId);
        if(valid.length == 0){
            return res.status(404).json({
                message: 'Nincs ilyen edzésterv!'
            });
        }
        next();
    } catch (error) {
        next(error);
    }
}
async function validateActive(req, res, next) {
    try {
        const allowedKeys = ['active'];
        const bodyKeys = Object.keys(req.body);

        // 1. csak az 'active' kulcs lehet
        for (let key of bodyKeys) {
            if (!allowedKeys.includes(key)) {
                return res.status(400).json({
                    message: `Nem megengedett mező: ${key}`
                });
            }
        }

        const { active } = req.body;

        // 2. kötelező mező
        if (active === undefined) {
            return res.status(400).json({
                message: "Hiányzó 'active' mező."
            });
        }

        // 3. null megengedett
        if (active === null) {
            return next();
        }

        // 4. típus ellenőrzés
        if (typeof active !== 'number' || !Number.isInteger(active) || active <= 0) {
            return res.status(400).json({
                message: "Érvénytelen 'active' érték."
            });
        }

        next();

    } catch (error) {
        next(error);
    }
}
async function validateAdminPlan(req, res, next) {
    try {
        const body = req.body;

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return res.status(400).json({
                message: 'Nem sikerült feldolgozni az edzésterv adatait.'
            });
        }

        let workoutPlan = {
            plan_id: body.plan_id ? Number(body.plan_id) : null,
            name: body.name,
            days_count: Number(body.days_count),
            level: body.level || null,
            location: body.location || null,
            goal: body.goal || null,
            description: body.description || null,
            is_public: body.is_public === '1' || body.is_public === 1 || body.is_public === true,
            days: body.days
        };

        if (typeof workoutPlan.days === 'string') {
            try {
                workoutPlan.days = JSON.parse(workoutPlan.days);
            } catch (error) {
                return res.status(400).json({
                    message: 'Nem sikerült feldolgozni az edzésnapokat.'
                });
            }
        }

        const allowedLevels = ['kezdo', 'kozep', 'halado'];
        const allowedLocations = ['gym', 'home_weights', 'home_bodyweight'];
        const allowedGoals = ['tomeg', 'szalkasitas', 'szintentartas'];

        if (!workoutPlan.name || typeof workoutPlan.name !== 'string' || !workoutPlan.name.trim() || workoutPlan.name.length > 100) {
            return res.status(400).json({
                message: 'Adj nevet az edzéstervnek.'
            });
        }

        workoutPlan.name = workoutPlan.name.trim();

        if (!Number.isInteger(workoutPlan.days_count) || workoutPlan.days_count < 1 || workoutPlan.days_count > 7) {
            return res.status(400).json({
                message: 'Legfeljebb 7 napos edzéstervet hozhatsz létre.'
            });
        }

        if (workoutPlan.level !== null && !allowedLevels.includes(workoutPlan.level)) {
            return res.status(400).json({
                message: 'Érvénytelen edzésterv szint.'
            });
        }

        if (workoutPlan.location !== null && !allowedLocations.includes(workoutPlan.location)) {
            return res.status(400).json({
                message: 'Érvénytelen edzés helyszín.'
            });
        }

        if (workoutPlan.goal !== null && !allowedGoals.includes(workoutPlan.goal)) {
            return res.status(400).json({
                message: 'Érvénytelen edzés cél.'
            });
        }

        if (workoutPlan.description !== null) {
            if (typeof workoutPlan.description !== 'string' || workoutPlan.description.length > 255) {
                return res.status(400).json({
                    message: 'A leírás legfeljebb 255 karakter lehet.'
                });
            }

            workoutPlan.description = workoutPlan.description.trim() || null;
        }

        if (!Array.isArray(workoutPlan.days)) {
            return res.status(400).json({
                message: 'Nem sikerült feldolgozni az edzésnapokat.'
            });
        }

        if (workoutPlan.days.length < 1) {
            return res.status(400).json({
                message: 'Adj hozzá legalább 1 napot az edzéstervhez.'
            });
        }

        if (workoutPlan.days.length > 7) {
            return res.status(400).json({
                message: 'Legfeljebb 7 napos edzéstervet hozhatsz létre.'
            });
        }

        if (workoutPlan.days.length !== workoutPlan.days_count) {
            return res.status(400).json({
                message: 'A napok száma nem egyezik az edzésnapokkal.'
            });
        }

        const usedDayNumbers = [];
        let restDaysCount = 0;

        for (let i = 0; i < workoutPlan.days.length; i++) {
            const day = workoutPlan.days[i];

            if (!day || typeof day !== 'object' || Array.isArray(day)) {
                return res.status(400).json({
                    message: 'Napok adatainak feldolgozása sikertelen!'
                });
            }

            if (!Number.isInteger(day.dayNumber) || day.dayNumber < 1 || day.dayNumber > 7 || usedDayNumbers.includes(day.dayNumber)) {
                return res.status(400).json({
                    message: 'Napok adatainak feldolgozása sikertelen!'
                });
            }

            usedDayNumbers.push(day.dayNumber);

            if (typeof day.name !== 'string' || !day.name.trim() || day.name.length > 100) {
                return res.status(400).json({
                    message: 'Adj nevet a napnak!'
                });
            }

            day.name = day.name.trim();

            if (typeof day.restDay !== 'boolean') {
                return res.status(400).json({
                    message: 'Napok adatainak feldolgozása sikertelen!'
                });
            }

            if (!Array.isArray(day.exercises)) {
                return res.status(400).json({
                    message: `${i + 1}. nap hiányos!`
                });
            }

            if (day.restDay === true) {
                restDaysCount++;

                if (day.exercises.length > 0) {
                    return res.status(400).json({
                        message: 'Ütközés: pihenőnap + gyakorlat nem lehet!'
                    });
                }

                continue;
            }

            if (day.exercises.length < 1) {
                return res.status(400).json({
                    message: `${i + 1}. nap hiányos!`
                });
            }

            const usedExerciseIds = [];
            const usedOrders = [];

            for (let j = 0; j < day.exercises.length; j++) {
                const exercise = day.exercises[j];

                if (!exercise || typeof exercise !== 'object' || Array.isArray(exercise)) {
                    return res.status(400).json({
                        message: 'Gyakorlatok feldolgozása sikertelen!'
                    });
                }

                exercise.exerciseId = Number(exercise.exerciseId);
                exercise.order = Number(exercise.order);

                if (!Number.isInteger(exercise.exerciseId) || exercise.exerciseId <= 0) {
                    return res.status(400).json({
                        message: 'Gyakorlatok feldolgozása sikertelen!'
                    });
                }

                if (!Number.isInteger(exercise.order) || exercise.order < 1) {
                    return res.status(400).json({
                        message: 'Gyakorlatok feldolgozása sikertelen!'
                    });
                }

                if (usedExerciseIds.includes(exercise.exerciseId)) {
                    return res.status(400).json({
                        message: 'Duplikáció a gyakorlatok között!'
                    });
                }

                if (usedOrders.includes(exercise.order)) {
                    return res.status(400).json({
                        message: 'Duplikáció a gyakorlatok sorrendjében!'
                    });
                }

                usedExerciseIds.push(exercise.exerciseId);
                usedOrders.push(exercise.order);

                const exist = await db.exerciseExist(exercise.exerciseId);

                if (!exist) {
                    return res.status(400).json({
                        message: 'Nem létező gyakorlat! (' + (i + 1) + '. nap)'
                    });
                }
            }
        }

        if (restDaysCount === workoutPlan.days.length) {
            return res.status(400).json({
                message: 'Edzésterv nem állhat csak pihenőnapból!'
            });
        }

        req.body = workoutPlan;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    validateNewPlan,
    validateUpdate,
    validateActive,
    validateAdminPlan
}