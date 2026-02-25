const db = require('../sql/database.js');

//? email validation regex
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
const patternEmail = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)?@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/;
//? Jelszo megengedett karakterei
const patternPass = /^[a-zA-Z0-9#?!\-]{8,64}$/;

async function validateLogin(req, res, next) {
    try {
        const { email, pass } = req.body;

        if(!email || !pass){
            return res.status(400).json({
                message: 'Hiányzó vagy érvénytelen mezők',
                id:1
            })
        }
        let patterError = [];
        if(!patternEmail.test(email)){
            patterError.push(1);
        }  
        if(!patternPass.test(pass)){
            patterError.push(2);
        }
        if(patterError.length>0){
            return res.status(400).json({
                message: 'Érvénytelen adat(ok)',
                id: 2,
                error: patterError
            })
        }

        const emailExist = await db.email_exist(email);
        if(emailExist != 1){
            return res.status(409).json({
                message: 'Nincs regisztrálva',
                id: 3,
            })
        }
        
        next();
    } catch (error) {
        next(error)
    }
}

function loggedIn(req, res, next){
    if(req.session?.user?.id){
        return res.redirect('/kerdoiv');
    }
    next()
}

module.exports = {
    validateLogin,
    loggedIn
}