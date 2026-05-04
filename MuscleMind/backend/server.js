const app = require('./app.js');
const db = require('./sql/database');

const ip = '127.0.0.1';
const port = 3000;

//!Szerver futtatása
app.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});

// óránként lejárt tokenek törlése
setInterval(async () => {
    try {
        await db.token_expire_del();
    } catch (error) {
        console.error('Cleanup error:', error.message);
    }
}, 60 * 60 * 1000);

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása: Control + C
//?Terminal ablak tartalmának törlése MacBookon: Command + K