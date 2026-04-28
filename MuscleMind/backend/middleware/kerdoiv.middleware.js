const db = require('../sql/database.js');
const path = require('path');

async function requireComplete(req, res, next) {
    try {
        const id = req.session.user.id;
        const completed = await db.registComp(id);
        if (completed != 1) {
            return res.redirect('/kerdoiv');
        }
        next();
    } catch (error) {
        next(error);
    }
}

async function registrationComplete(req, res, next) {
    try {
        const id = req.session.user.id;
        const completed = await db.registComp(id);
        if(completed == 1){
            return res.redirect('/')
        }
        next()
    } catch (error) {
        next(error);
    }
}

async function validateInput(req, res, next){
    try {
        const keyCount = Object.keys(req.body).length;
        if(keyCount != 10){
            return res.status(400).json({
                message: 'Validation error'
            })
        }
        const validAns = [
            [
                "férfi",
                "nő"
            ],

            [
                "tömegnövelés",
                "szálkásítás",
                "szintentartás"
            ],

            [
                "kezdő (0–6 hónap)",
                "középhaladó (6–24 hónap)",
                "haladó (2+ év)"
            ],

            [
                "2–3 nap",
                "4 nap",
                "5–6 nap"
            ],

            [
                "konditeremben",
                "otthon, súlyzókkal",
                "otthon, saját testsúllyal"
            ],

            [
                "mindenevő",
                "vegetáriánus",
                "vegán"
            ],

            [
                "2–3 alkalom",
                "4–5 alkalom",
                "6 vagy több alkalom"
            ]
        ];
        const {weight, birthDate, height, gender, goal, experienceLevel, trainingDays, trainingLocation, dietType, mealsPerDay} = req.body;
        let index = 0;
        if(weight<40 || weight >200 || weight ==null){
            return res.status(400).json({
                message: 'Validation error',
                id: index
            })
        }else{index++}
        if(typeof birthDate !== 'string' || !birthDate.trim()){
            return res.status(400).json({
                message: 'Validation error',
                id: index
            })
        }
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if(!datePattern.test(birthDate)){
            return res.status(400).json({
                message: 'Validation error',
                id: index
            });
        }
        const birth = new Date(birthDate);
        const today = new Date();

        if(Number.isNaN(birth.getTime()) || birth > today){
            return res.status(400).json({
                message: 'Validation error',
                id: index
            });
        }

        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if(monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())){
            age--;
        }

        if(age < 18 || age > 99){
            return res.status(400).json({
                message: 'Validation error',
                id: index
            });
        }else{index++}
        
        if(height<140 || height >220 || height ==null){
            return res.status(400).json({
                message: 'Validation error',
                id: index
            })
        }else{index++}

        const answers = [
            gender,
            goal,
            experienceLevel,
            trainingDays,
            trainingLocation,
            dietType,
            mealsPerDay
        ];

        for (let i = 0; i < validAns.length; i++) {

            const userValue = answers[i];

            if (typeof userValue !== "string") {
                return res.status(400).json({ message: "Validation error" });
            }
            if(!validAns[i].includes(userValue)){
                return res.status(400).json({ message: "Validation error",
                id: index });
            }else{index++}
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registrationComplete,
    validateInput,
    requireComplete
};