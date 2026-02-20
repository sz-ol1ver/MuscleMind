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
const { registration_insert } = require('../sql/database');
const router = express.Router();
const bcrypt = require('bcrypt');
const requestIp = require('request-ip');

const saltRounds = 12;
// email validation regex
/*1️⃣ Local part (before @):
   - [a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+
     → allows letters, numbers, and valid special characters
   - (\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)?
     → optional single dot in the local part
     → prevents consecutive dots, start/end dots

2️⃣ @ symbol:
   - Literal '@' separating local part and domain

3️⃣ Domain part (after @):
   - [a-zA-Z0-9-]+
     → first part of the domain: letters, numbers, hyphens
   - (\.[a-zA-Z0-9-]+)*
     → optional subdomains (e.g., .com, .co.uk)
   - Allows numbers and letters in the domain

4️⃣ Anchors:
   - ^ and $ ensure the entire string matches*/
const emailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)?@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/;
//? Nev megengedett karakterei
const patterName = /^[a-zA-Z]*$/;
//? Felhasznalonev megengedett karakterei
const patterUser = /^[a-z0-9]*$/;
//? Jelszo megengedett karakterei
const patterPass = /^[a-zA-Z0-9]*$/;

//const insert = await registration_insert(data.firstN, data.lastN, data.userN, data.email, data.pass);
//console.log(insert)

router.post('/', async(request, response) => {
    try {
        const data = request.body;
        const ip = requestIp.getClientIp(request);
    } catch (error) {
        console.log(error.message)
        response.status(500).json({
            response: 'Sikertelen eleres!',
            error: error.message
        })
    }
});

module.exports = router;