// Tesztfájl betöltéséhez
const fs = require('fs');
const path = require('path');

// Frontend register modul izolált betöltése
function loadRegisterScript(mockRegistration) {
    const registerJsPath = path.join(__dirname, '../javascript/register.js');

    const registerJsCode = fs
        .readFileSync(registerJsPath, 'utf8')
        .replace(
            /import\s*\{\s*registration\s*\}\s*from\s*['"]\.\/api\.js['"];?/,
            'const { registration } = mockApi;'
        );

    // Script futtatása jsdom környezetben
    new Function('document', 'window', 'mockApi', registerJsCode)(
        document,
        window,
        { registration: mockRegistration }
    );
}

// Teszt DOM felépítése
function createRegistrationDom() {
    document.body.innerHTML = `
        <form id="registration-form">
            <input id="last-name" name="lastN" value="" />
            <input id="first-name" name="firstN" value="" />
            <input id="userName" name="userN" value="" />
            <input id="email-regist" name="email" value="" />
            <input id="password-regist" name="pass" value="" />
            <input id="password-confirm-regist" name="pass-confirm" value="" />
            <button id="regist-in" type="button" disabled>Register</button>
            <div id="password-feedback"></div>
        </form>
    `;
}

function fillValidRegistrationForm() {
    const lastName = document.getElementById('last-name');
    const firstName = document.getElementById('first-name');
    const userName = document.getElementById('userName');
    const email = document.getElementById('email-regist');
    const password = document.getElementById('password-regist');
    const passwordConfirm = document.getElementById('password-confirm-regist');

    lastName.value = 'Teszt';
    firstName.value = 'Felhasznalo';
    userName.value = 'tesztuser';
    email.value = 'test@example.com';
    password.value = 'ValidPass1!';
    passwordConfirm.value = 'ValidPass1!';

    email.dispatchEvent(new Event('input'));
    userName.dispatchEvent(new Event('input'));
    password.dispatchEvent(new Event('input'));
    passwordConfirm.dispatchEvent(new Event('input'));
}

describe('Registration page logic', () => {
    // Teszt DOM alaphelyzetbe állítása
    beforeEach(() => {
        jest.resetModules();
        createRegistrationDom();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    // Negatív teszt: kötelező mezők hiánya
    test('Missing required fields shows error and does not call registration helper', async () => {
        // Hibás regisztrációs mock
        const mockRegistration = jest.fn();

        // Register script betöltése
        loadRegisterScript(mockRegistration);
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // DOM elemek lekérése
        const registerBtn = document.getElementById('regist-in');
        const feedback = document.getElementById('password-feedback');

        // Gomb engedélyezése hibás állapotban
        registerBtn.disabled = false;
        // Gombnyomás szimulálása
        registerBtn.click();

        // Elvárt eredmény: nincs helper hívás és hibaüzenet
        expect(mockRegistration).not.toHaveBeenCalled();
        expect(feedback.innerHTML).toContain('Hiányos név!');
    });

    // Negatív teszt: nem egyező jelszavak
    test('Non-matching passwords keep button disabled and show mismatch feedback', async () => {
        const mockRegistration = jest.fn();

        loadRegisterScript(mockRegistration);
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // DOM elemek lekérése
        const lastName = document.getElementById('last-name');
        const firstName = document.getElementById('first-name');
        const userName = document.getElementById('userName');
        const email = document.getElementById('email-regist');
        const password = document.getElementById('password-regist');
        const passwordConfirm = document.getElementById('password-confirm-regist');
        const registerBtn = document.getElementById('regist-in');
        const feedback = document.getElementById('password-feedback');

        // Helyes regisztrációs szöveg, de nem egyező jelszavak
        lastName.value = 'Teszt';
        firstName.value = 'Felhasznalo';
        userName.value = 'tesztuser';
        email.value = 'test@example.com';
        password.value = 'ValidPass1!';

        password.dispatchEvent(new Event('input'));
        email.dispatchEvent(new Event('input'));
        userName.dispatchEvent(new Event('input'));

        passwordConfirm.value = 'Mismatch1!';
        passwordConfirm.dispatchEvent(new Event('input'));

        // Elvárt eredmény: hibaüzenet és gomb tiltva
        expect(feedback.innerHTML).toContain('A két jelszó különbözik!');
        expect(registerBtn.disabled).toBe(true);
        expect(mockRegistration).not.toHaveBeenCalled();
    });

    // Pozitív teszt: sikeres regisztráció és siker visszajelzés
    test('Valid registration calls registration helper and shows success feedback', async () => {
        jest.useFakeTimers();

        // Sikeres regisztráció mock
        const mockRegistration = jest.fn().mockResolvedValue({
            message: 'Sikeres regisztráció'
        });

        // Register script betöltése
        loadRegisterScript(mockRegistration);
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Érvényes regisztrációs mezők kitöltése
        fillValidRegistrationForm();

        const registerBtn = document.getElementById('regist-in');
        const feedback = document.getElementById('password-feedback');

        expect(registerBtn.disabled).toBe(false);

        // Gombnyomás szimulálása
        registerBtn.click();

        await Promise.resolve();

        // Helper hívás ellenőrzése
        expect(mockRegistration).toHaveBeenCalledWith(
            'http://127.0.0.1:3000/api/auth/registration',
            expect.anything()
        );

        // Elvárt eredmény: sikerüzenet
        expect(feedback.innerHTML).toContain('Sikeres regisztráció');

        // Nem futtatjuk le a redirectet indító timert,
        // mert jsdom alatt a window.location.href navigáció console.error zajt okoz.
    });
});