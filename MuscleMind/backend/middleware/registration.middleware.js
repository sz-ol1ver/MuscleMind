const db = require('../sql/database.js');

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
const patternEmail = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)?@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/;
//? Nev megengedett karakterei
const patternName = /^[a-zA-Z]*$/;
//? Felhasznalonev megengedett karakterei
const patternUser = /^[a-z0-9]*$/;
//? Jelszo megengedett karakterei
const patternPass = /^[a-zA-Z0-9]*$/;

async function validateRegistration(req, res, next) {
    try {
        const { firstN, lastN, userN, email, pass } = req.body;

        if(!firstN || !lastN || !userN || !email || !pass){
            return res.status(400).json({
                error: 'Hiányzó vagy érvénytelen mezők'
            })
        }
        let patterError = [];
        if(!patternName.test(firstN) || !patternName.test(lastN)){
            patterError.push(1);
        } 
        if(!patternUser.test(userN)){
            patterError.push(2);
        }
        if(!patternEmail.test(email)){
            patterError.push(3);
        }  
        if(!patternPass.test(pass)){
            patterError.push(4);
        }
        if(patterError.length>0){
            return res.status(400).json({
                message: 'Érvénytelen adat(ok)',
                error: patterError
            })
        }

        let exist =[];
        const emailExist = await db.username_exist(userN);
        if(emailExist == 1){
            exist.push(1);
        }
        const usernameExist = await db.email_exist(email);
        if(usernameExist == 1){
            exist.push(2);
        }
        if(exist.length >0){
            return res.status(409).json({
                message: 'Ütközés a meglévő felhasználóval',
                error: exist
            })
        }
        
        next();
    } catch (error) {
        next(error)
    }
}

module.exports = validateRegistration;