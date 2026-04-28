const db = require('../sql/database.js');
const path = require('path');

async function requireAdmin(req, res, next) {
    try {
        const isAdmin = req.session.user.admin;
        if (isAdmin != 1) {
            return res.sendFile(path.join(__dirname, '../views/403.html'))
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    requireAdmin
}