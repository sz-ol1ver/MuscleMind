const db = require('../sql/database.js');

async function validateNewPlan(req,res, next) {
    try {
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    validateNewPlan
}