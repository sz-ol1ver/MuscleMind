//!Module-ok importálása
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const path = require('path');
const {registrationComplete, requireComplete} = require('./middleware/kerdoiv.middleware.js');
const {requireAdmin} = require('./middleware/isAdmin.middleware.js')
const loginMw = require('./middleware/login.middleware.js');

//!Beállítások
const app = express();
const router = express.Router();

const ip = '127.0.0.1';
const port = 3000;

app.use(express.json()); //?Middleware JSON
app.set('trust proxy', 1); //?Middleware Proxy

//? https --> http
app.use((req, res, next) => {
    if (req.secure) {
        return res.redirect('http://' + req.headers.host + req.url);
    }
    next();
});

app.use(express.static(path.join(__dirname, '../frontend'))); //?frontend mappa tartalmának betöltése az oldal működéséhez

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
router.get('/', loginMw.requireAuthPage, requireComplete, (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});
router.get('/bejelentkezes', loginMw.redirectIfLoggedIn ,(request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/login.html'));
});
router.get('/jelszo-keres', loginMw.redirectIfLoggedIn ,(request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/forgot-password.html'));
});
router.get('/uj-jelszo', loginMw.redirectIfLoggedIn ,(request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/reset-password.html'));
});
router.get('/regisztracio', loginMw.redirectIfLoggedIn,(request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/registration.html'));
});
router.get('/kerdoiv', loginMw.requireAuthPage, registrationComplete,(request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/questionnaire.html'));
});
router.get('/admin', loginMw.requireAuthPage ,requireAdmin, (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/admin.html'));
});
router.get('/profil', loginMw.requireAuthPage, requireComplete, (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/profile.html'));
});
router.get('/ranglista', loginMw.requireAuthPage, requireComplete, (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/ranglist.html'));
});
router.get('/etrend', loginMw.requireAuthPage, requireComplete, (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/meals.html'));
});
router.get('/edzesterv', loginMw.requireAuthPage, requireComplete, (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/workout.html'));
});
router.get('/statisztika', loginMw.requireAuthPage, requireComplete, (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/stats.html'));
});


//!API endpoints
app.use('/', router);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);

//! API 404
app.use('/api', (req, res) => {
    return res.status(404).json({
        message: 'Az API végpont nem található!'
    });
});

//! Oldal 404
app.use((req, res) => {
    return res.sendFile(path.join(__dirname, 'views', '404.html'));
});

//! Globális hibakezelő middleware
//! Globális hibakezelő middleware
app.use((err, req, res, next) => {
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            message: 'Már létező felhasználó!',
            id: 3
        });
    }

    console.error(err.message);

    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.status || 500).json({
            message: err.message || 'Belső szerverhiba történt!',
            status: err.status || 500
        });
    }

    return res
        .status(err.status || 500)
        .sendFile(path.join(__dirname, 'views', '500.html'));
});

//!Szerver futtatása
app.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K
