const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const auth = require('./auth.routes.js');
const qtn = require('./questionnaire.routes.js')
const wOut = require('./workout.routes.js');
const profile = require('./profile.routes.js');
const supportTicket = require('./ticket.routes.js');
const adminApis = require('./admin.routes.js');
const statApis = require('./stats.routes.js');
const mealsApis = require('./meals.routes.js');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({ storage });

//!Endpoints:
router.use('/auth', auth);
router.use('/question', qtn);
router.use('/workout', wOut);
router.use('/profile', profile);
router.use('/tickets', supportTicket);
router.use('/admin', adminApis);
router.use('/stats', statApis);
router.use('/meals', mealsApis);

//?GET /api/testsql
/*router.get('/testsql', async (request, response) => {
    try {
        const selectall = await db.selectall();
        response.status(200).json({
            message: 'Ez a végpont működik.',
            results: selectall
        });
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});*/

module.exports = router;
