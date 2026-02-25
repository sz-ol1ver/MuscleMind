const { response } = require('express');
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

module.exports = registrationComplete;