// Tesztfájl betöltéséhez
const fs = require('fs');
const path = require('path');

// Frontend login modul izolált betöltése
function loadLoginScript(mockLogin) {
    const loginJsPath = path.join(__dirname, '../javascript/login.js');

    const loginJsCode = fs
        .readFileSync(loginJsPath, 'utf8')
        .replace(
            /import\s*\{\s*login\s*\}\s*from\s*['"]\.\/api\.js['"];?/,
            'const { login } = mockApi;'
        );

    // Script futtatása jsdom környezetben
    new Function('document', 'window', 'mockApi', loginJsCode)(
        document,
        window,
        { login: mockLogin }
    );
}

describe('Login page logic', () => {
    // Teszt DOM felépítése
    beforeEach(() => {
        jest.resetModules();

        document.body.innerHTML = `
            <form id="login-form">
                <input id="email-login" name="email" value="" />
                <input id="password-login" name="pass" value="" disabled />
                <button id="login-in" type="button" disabled>Login</button>
                <div id="password-feedback"></div>
            </form>
        `;

        sessionStorage.clear();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    // Pozitív teszt: sikeres login folyamat és siker visszajelzés
    test('Valid login data calls login helper and shows success feedback', async () => {
        jest.useFakeTimers();

        // Sikeres login mock
        const mockLogin = jest.fn().mockResolvedValue({
            message: 'Sikeres bejelentkezés'
        });

        // Login script betöltése
        loadLoginScript(mockLogin);
        // DOMContentLoaded szimulálása
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // DOM elemek lekérése
        const email = document.getElementById('email-login');
        const password = document.getElementById('password-login');
        const loginBtn = document.getElementById('login-in');
        const feedback = document.getElementById('password-feedback');

        // Helyes input adatok
        email.value = 'test@example.com';
        email.dispatchEvent(new Event('input'));

        // Jelszó megadása
        password.value = 'ValidPass1!';
        password.dispatchEvent(new Event('input'));

        expect(password.disabled).toBe(false);
        expect(loginBtn.disabled).toBe(false);

        // Gombnyomás szimulálása
        loginBtn.click();

        await Promise.resolve();

        // Helper hívás ellenőrzése
        expect(mockLogin).toHaveBeenCalledWith(
            'http://127.0.0.1:3000/api/auth/login',
            expect.any(FormData)
        );

        // Elvárt eredmények
        expect(feedback.innerHTML).toBe('Sikeres bejelentkezés');
        expect(feedback.style.color).toBe('lightgreen');
        expect(sessionStorage.getItem('showWorkoutReminder')).toBe('true');

        // Nem futtatjuk le a redirectet indító timert,
        // mert jsdom alatt a window.location.href navigáció console.error zajt okoz.
    });

    // Negatív teszt: hibás login válasz kezelése
    test('Invalid login response displays error feedback', async () => {
        // Hibás login mock
        const mockLogin = jest.fn().mockRejectedValue({
            id: 3,
            message: 'Hibás adat'
        });

        // Login script betöltése
        loadLoginScript(mockLogin);
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // DOM elemek lekérése
        const email = document.getElementById('email-login');
        const password = document.getElementById('password-login');
        const loginBtn = document.getElementById('login-in');
        const feedback = document.getElementById('password-feedback');

        // Helyes input adatok
        email.value = 'test@example.com';
        email.dispatchEvent(new Event('input'));

        password.value = 'ValidPass1!';
        password.dispatchEvent(new Event('input'));

        expect(password.disabled).toBe(false);
        expect(loginBtn.disabled).toBe(false);

        // Gombnyomás szimulálása
        loginBtn.click();

        await Promise.resolve();

        // Helper hívás ellenőrzése
        expect(mockLogin).toHaveBeenCalledWith(
            'http://127.0.0.1:3000/api/auth/login',
            expect.any(FormData)
        );

        // Elvárt eredmény: hibás visszajelzés
        expect(feedback.innerHTML).toContain('Hibás adat');
        expect(feedback.style.fontWeight).toBe('bolder');
        expect(feedback.style.color).toContain('rgb');
    });
});