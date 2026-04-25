const db = require('../sql/database.js');
const path = require('path');

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
const patternEmail = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/;
//? Jelszo megengedett karakterei
const patternPass = /^[a-zA-Z0-9#?!$._*:\-!@%^&()+=<>[\]{}|\\,./~`]{8,64}$/;

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
                message: 'Érvénytelen e-mail cím vagy jelszó!',
                id: 3,
            })
        }
        
        next();
    } catch (error) {
        next(error)
    }
}

function redirectIfLoggedIn(req, res, next){
    if(req.session?.user?.id){
        return res.redirect('/');
    }
    next()
}
function requireAuthPage(req, res, next){
    if(!req.session?.user?.id){
        return res.sendFile(path.join(__dirname, '../views/401.html'));
    }
    next()
}

function requireAuthApi(req, res, next){
    if(!req.session?.user?.id){
        return res.status(401).json({
            message: 'Nincs bejelentkezve!'
        });
    }
    next()
}

async function requestPassword(req,res,next) {
    try {
        const allowedKeys = ['email'];
        const {email} = req.body;

        if(!email || typeof email !== 'string'){
            return res.status(400).json({
                message: 'Nincs megadva email cím!'
            });
        };
        const objectKeys = Object.keys(req.body);
        if(allowedKeys.length != objectKeys.length){
            return res.status(400).json({
                message: 'Érvénytelen adatok!'
            });
        };
        for(let i =0; i<objectKeys.length;i++){
            if(!allowedKeys.includes(objectKeys[i])){
                return res.status(400).json({
                    message: 'Érvénytelen adatok!'
                });
            };
        };
        if(!patternEmail.test(email)){
            return res.status(400).json({
                message: 'Érvénytelen adatok!'
            });
        };

        next();
    } catch (error) {
        next(error);
    }
}

async function newPassword(req,res,next) {
    try {
        const { password, confirm, token } = req.body;

        const allowedKeys = ['password', 'confirm', 'token'];
        const objectKeys = Object.keys(req.body);

        if (objectKeys.length !== allowedKeys.length) {
            return res.status(400).json({
                message: 'Érvénytelen adatok!'
            });
        }

        for (let key of objectKeys) {
            if (!allowedKeys.includes(key)) {
                return res.status(400).json({
                    message: 'Érvénytelen adatok!'
                });
            }
        }

        if (!password || !confirm || !token) {
            return res.status(400).json({
                message: 'Hiányzó adatok!'
            });
        }

        if (
            typeof password !== 'string' ||
            typeof confirm !== 'string' ||
            typeof token !== 'string'
        ) {
            return res.status(400).json({
                message: 'Érvénytelen adatok!'
            });
        }

        if (password !== confirm) {
            return res.status(400).json({
                message: 'A jelszavak nem egyeznek!'
            });
        }

        if (!patternPass.test(password)) {
            return res.status(400).json({
                message: 'A jelszó nem megfelelő formátumú!'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    validateLogin,
    redirectIfLoggedIn,
    requireAuthPage,
    requireAuthApi,
    requestPassword,
    newPassword
}