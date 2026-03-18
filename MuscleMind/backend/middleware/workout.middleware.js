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
        const allowedDay = ['dayId','dayNumber', 'name', 'restDay', 'exercises'];
        const allowedExercise = ['exerciseId', 'name', 'order'];
        console.log(workoutPlan);
        console.log(workoutPlan.days[1].exercises)
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
                    message: 'Napok adatainak feldolgozása sikertelen!2'
                });
            }
            napokSzama.push(day.dayNumber);
            if(typeof day.name !== 'string' || !day.name.trim()){
                return res.status(400).json({
                    message: 'Adj nevet a napnak!'
                });
            }
            if(typeof day.restDay !== 'number'){
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
module.exports = {
    validateNewPlan,
    validateUpdate,
    validateActive
}