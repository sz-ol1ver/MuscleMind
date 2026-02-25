const db = require('../sql/database.js');
async function registrationComplete(req, res, next) {
    try {
        if(!req.session.user || !req.session){
            return res.status(401).json({
                message: 'Authentication required!'
            })
        }
        const id = req.session.user.id;
        const completed = await db.registComp(id);
        if(completed == 1){
            return res.status(403).json({
                message: 'Registration already completed!'
            })
        }
        next()
    } catch (error) {
        next(error);
    }
}

module.exports = registrationComplete;