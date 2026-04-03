const db = require('../sql/database.js');
const path = require('path');

async function requireAdmin(req, res, next) {
    try {
        const id = req.session.user.id;
        const completed = await db.isAdminCheck(id);
        if (completed.length < 1) {
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