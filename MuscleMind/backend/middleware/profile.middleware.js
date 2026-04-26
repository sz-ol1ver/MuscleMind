const db = require('../sql/database.js')


//Regex cucc
const patternEmail = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)?@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/
const patternName = /^[a-zA-Z]*$/
const patternUser = /^[a-z0-9]{3,20}$/
const patternPass = /^[a-zA-Z0-9#?!\-]{8,64}$/

async function validateProfileUpdate(req, res, next) {
    try {
        const body = req.body
        const id = req.session.user.id

        // Redgi adatok
        const oldBasic = await db.getUserBasicData(id)
        const oldPref = await db.getUserPreferencesData(id) || {}

        // Kovertalashoz kellenek
        let newBirthDate = oldPref.age || null

        if (body.age) {
            newBirthDate = body.age
        }

        let newHeight = oldPref.height || null
        if (body.height) {
            newHeight = parseInt(body.height)
        }

        let newWeight = null
        if (body.weight) {
            newWeight = parseFloat(body.weight)
        }

        // Merge adatok letrehozasa
        const mergedData = {
            username: body.username || oldBasic.username,
            first_name: body.first_name || oldBasic.first_name,
            last_name: body.last_name || oldBasic.last_name,
            email: body.email || oldBasic.email,
            password: body.password || null,
            birth_date: newBirthDate,
            height: newHeight,
            weight: newWeight,
            goal: body.goal || oldPref.goal || null,
            experience_level: body.experience_level || oldPref.experience_level || null,
            training_days: body.training_days || oldPref.training_days || null,
            training_location: body.training_location || oldPref.training_location || null,
            diet_type: body.diet_type || oldPref.diet_type || null,
            meals_per_day: body.meals_per_day || oldPref.meals_per_day || null
        }

        // Regex validacio a szemelyes adatoknal (ha volt uj bekuldve)
        let patterError = []
        let errorMessages = []

        if ((body.first_name && !patternName.test(body.first_name)) || (body.last_name && !patternName.test(body.last_name))) {
            patterError.push(1)
            errorMessages.push("Nev: a-z & A-Z")
        }
        if (body.username && !patternUser.test(body.username)) {
            patterError.push(2)
            errorMessages.push("Felhasználónév: 3–20 karakter, csak kisbetű és szám")
        }
        if (body.email && !patternEmail.test(body.email)) {
            patterError.push(3)
            errorMessages.push("Helytelen email cim megadás!")
        }
        if (body.password && !patternPass.test(body.password)) {
            patterError.push(4)
            errorMessages.push("Jelszó: 8–64 karakter, betűk, számok és '#' '?' '!' '-' engedélyezett")
        }

        if (patterError.length > 0) {
            return res.status(400).json({
                message: 'A mentés nem sikerült:\n\n' + errorMessages.join('\n'),
                id: 2,
                error: patterError
            })
        }

        // Email es username marvan ellenorzes
        let exist = []
        if (body.email && body.email !== oldBasic.email) {
            const emailExist = await db.email_exist(body.email)
            if (emailExist == 1) {
                exist.push(1)
            }
        }
        if (body.username && body.username !== oldBasic.username) {
            const usernameExist = await db.username_exist(body.username)
            if (usernameExist == 1) {
                exist.push(2)
            }
        }
        if (exist.length > 0) {
            return res.status(409).json({
                message: 'Ütközés a meglévő felhasnálóval',
                id: 3,
                error: exist
            })
        }

        // Kerdoiv adatok elenorzese
        if (mergedData.birth_date) {
            const birthDate = new Date(mergedData.birth_date)

            if (isNaN(birthDate.getTime())) {
                return res.status(400).json({
                    message: "Érvénytelen születési dátum!"
                })
            }

            const today = new Date()
            let age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }

            if (age < 18 || age > 99) {
                return res.status(400).json({
                    message: "Érvénytelen életkor (18-99)!"
                })
            }
        }
        if (mergedData.height && (isNaN(mergedData.height) || mergedData.height < 140 || mergedData.height > 220)) {
            return res.status(400).json({
                message: "Érvénytelen magasság (140-220)!"
            })
        }
        if (mergedData.weight && (isNaN(mergedData.weight) || mergedData.weight < 40 || mergedData.weight > 200)) {
            return res.status(400).json({
                message: "Érvénytelen testsúly (40-200)!"
            })
        }

        // Modositott adatok tovabbadasa
        req.mergedProfileData = mergedData
        req.oldProfileBasicData = oldBasic

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    validateProfileUpdate
}