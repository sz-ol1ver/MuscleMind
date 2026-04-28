const db = require('../sql/database.js');

async function validateTicket(req,res,next) {
    try {
        const id = req.session.user.id;
        const ticketCreationCount = await db.limitTicketCreation(id);
        if(ticketCreationCount >= 5){
            return res.status(429).json({
                message: 'Túl sok ticketet hoztál létre rövid időn belül!'
            })
        }


        const allowedKeys = ['email', 'category', 'subject', 'preId', 'message'];
        const bodyKeys = Object.keys(req.body);

        // extra mezők tiltása
        for (const key of bodyKeys) {
            if (!allowedKeys.includes(key)) {
                return res.status(400).json({
                    message: 'Hibás adatok!'
                });
            }
        }

        const {email, category, subject, preId, message} = req.body;
        const dbUserEmail = await db.findTicketEmail(id);

        if(email && email !== dbUserEmail){
            return res.status(400).json({
                message: 'Hibás adatok!'
            });
        }
        if(preId){
            const numPreId = Number(preId);
            if (!Number.isInteger(numPreId) || numPreId < 1) {
                return res.status(400).json({
                    message: 'Hibás adatok!'
                });
            }
            const dbPreId = await db.findPreId(numPreId, id);
            if (dbPreId.length < 1) {
                return res.status(400).json({
                    message: 'Hibás adatok!'
                });
            }
        }
        if (!category || !subject?.trim() || !message?.trim()) {
            return res.status(400).json({
                message: 'Hibás adatok!'
            });
        }
        if (!['contact', 'bug', 'idea'].includes(category)) {
            return res.status(400).json({
                message: 'Hibás adatok!'
            });
        }
        if (subject.trim().length > 50) {
            return res.status(400).json({
                message: 'A tárgy legfeljebb 50 karakter lehet!'
            });
        }


        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    validateTicket
}