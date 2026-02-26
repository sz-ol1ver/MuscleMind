const db = require('../sql/database.js');
async function registrationComplete(req, res, next) {
    try {
        if(!req.session || !req.session.user || !req.session.user.id){
            return res.redirect('/bejelentkezes')
        }
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
        const {weight, age, height, gender, goal, experienceLevel, trainingDays, trainingLocation, dietType, mealsPerDay} = req.body;
        let index = 0;
        if(weight<40 || weight >200 || weight ==null){
            return res.status(400).json({
                message: 'Validation error',
                id: index
            })
        }else{index++}
        if(age<18 || age >99 || age ==null){
            return res.status(400).json({
                message: 'Validation error',
                id: index
            })
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
    validateInput
};