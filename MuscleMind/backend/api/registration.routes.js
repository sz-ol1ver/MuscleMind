/*
HTTP státuszok a regisztrációs folyamatnál:

1. Sikeres regisztráció:
   - 201 Created   : Az új felhasználó sikeresen létrejött.
   - 200 OK        : Siker, de új erőforrás létrehozása nem különleges.

2. Input validációs hibák:
   - 400 Bad Request : Hiányzó vagy érvénytelen mezők.
     Példa: email formátum hibás, jelszó túl rövid.

3. Ütköző adatok:
   - 409 Conflict : Már létező felhasználónév vagy email.

4. Engedélyezési problémák (ritka regisztrációnál):
   - 401 Unauthorized : Ha hozzáférés kellene a regisztrációhoz.
   - 403 Forbidden    : Ha a regisztráció tiltott bizonyos okból.

5. Szerverhibák:
   - 500 Internal Server Error : Váratlan backend vagy adatbázis hiba.
   - 503 Service Unavailable   : Adatbázis vagy szolgáltatás ideiglenesen nem elérhető.
*/
const express = require('express');
const db = require('../sql/database');
const router = express.Router();
const bcrypt = require('bcrypt'); // npm install bcrypt
const requestIp = require('request-ip'); // npm install request-ip
const validateRegistration = require('../middleware/registration.middleware.js');

const saltRounds = 12;

router.post('/', validateRegistration, async(request, response) => {
    try {
        const data = request.body;
        const ip = requestIp.getClientIp(request);
        const hashed = await bcrypt.hash(data.pass, saltRounds);
        const insert = await db.registration_insert(data.firstN, data.lastN, data.userN, data.email, hashed);
        await db.log(insert, data.userN, 'registration', 'registration 1/2',ip);
        console.log(insert);
        response.status(201).json({
            message: 'Sikeres regisztráció'
        })
    } catch (error) {
        console.log(error.message)
        response.status(500).json({
            response: 'Sikertelen eleres!',
            error: error.message
        })
    }
});

module.exports = router;