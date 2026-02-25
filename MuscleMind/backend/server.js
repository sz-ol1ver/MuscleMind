//!Module-ok importálása
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const path = require('path');
const registrationValidate = require('./middleware/kerdoiv.middleware.js');

//!Beállítások
const app = express();
const router = express.Router();

const ip = '127.0.0.1';
const port = 3000;

app.use(express.json()); //?Middleware JSON
app.set('trust proxy', 1); //?Middleware Proxy

//!Session beállítása:
app.use(
    session({
        secret: 'titkos_kulcs',
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            httpOnly: true,
            maxAge: 30 * 60 * 1000,
            sameSite: 'lax',
            secure: false
        }
    })
);

//!Routing
//?Főoldal:
router.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});
router.get('/bejelentkezes', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/login.html'));
});
router.get('/regisztracio', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/registration.html'));
});
router.get('/kerdoiv', registrationValidate,(request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/questionnaire.html'));
});
router.get('/admin', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/admin.html'));
});
router.get('/profil', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/profile.html'));
});
router.get('/ranglista', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/ranglist.html'));
});
router.get('/etrend', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/meals.html'));
});
router.get('/edzesterv', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/workout.html'));
});


//!API endpoints
app.use('/', router);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);

//! Globális hibakezelő middleware
app.use((err, req, res, next) => {
    // DUPLICATE KEY
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
        message: "Már létező felhasználó!",
        id:3
        });
    }
    console.error(err.message); // log a szerveren
    res.status(400).json({
         message: err.message,
         status: err.status
        }); // vissza a kliensnek JSON-ban
});

//!Szerver futtatása
app.use(express.static(path.join(__dirname, '../frontend'))); //?frontend mappa tartalmának betöltése az oldal működéséhez
app.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K
