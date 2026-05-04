const path = require('path');
// Adatbázis mock
const mockDb = {
    email_exist: jest.fn()
};

jest.mock('../sql/database.js', () => mockDb);

// Auth middleware importálása
const {
    validateLogin,
    redirectIfLoggedIn,
    requireAuthPage
} = require('../middleware/login.middleware');

function createResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        sendFile: jest.fn(),
        redirect: jest.fn()
    };
}

describe('Auth middleware', () => {
    // Mockok alaphelyzetbe állítása
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Pozitív teszt: valid login folyamathoz next()
    test('validateLogin allows valid credentials and calls next()', async () => {
        // Helyes login adatok
        const req = {
            body: {
                email: 'test@example.com',
                pass: 'ValidPass1!'
            }
        };
        // Mock response
        const res = createResponse();
        // Mock next
        const next = jest.fn();

        // Mock adatbázis válasz
        mockDb.email_exist.mockResolvedValue(1);

        // Middleware futtatása
        await validateLogin(req, res, next);

        // Elvárt eredmény: db hívás és next()
        expect(mockDb.email_exist).toHaveBeenCalledWith('test@example.com');
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // Negatív teszt: hibás email/jelszó validáció
    test('validateLogin rejects invalid email/password values', async () => {
        // Hibás email/jelszó
        const req = {
            body: {
                email: 'invalid-email',
                pass: '123'
            }
        };
        const res = createResponse();
        const next = jest.fn();

        // Middleware futtatása
        await validateLogin(req, res, next);

        // Elvárt eredmény: 400 és hibaüzenet
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Érvénytelen adat(ok)',
            id: 2
        }));
        expect(next).not.toHaveBeenCalled();
    });

    // Negatív teszt: bejelentkezett felhasználó átirányítása
    test('redirectIfLoggedIn sends redirect when user is logged in', () => {
        // Bejelentkezett session
        const req = { session: { user: { id: 42 } } };
        const res = createResponse();
        const next = jest.fn();

        // Middleware futtatása
        redirectIfLoggedIn(req, res, next);

        // Elvárt eredmény: redirect és next nincs
        expect(res.redirect).toHaveBeenCalledWith('/');
        expect(next).not.toHaveBeenCalled();
    });

    test('redirectIfLoggedIn calls next when user is not logged in', () => {
        // Üres session
        const req = { session: {} };
        const res = createResponse();
        const next = jest.fn();

        // Middleware futtatása
        redirectIfLoggedIn(req, res, next);

        // Elvárt eredmény: továbbengedés
        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    // Negatív teszt: anon felhasználó tiltása 401 oldallal
    test('requireAuthPage blocks anonymous users with 401 page', () => {
        const req = { session: {} };
        const res = createResponse();
        const next = jest.fn();

        requireAuthPage(req, res, next);

        expect(res.sendFile).toHaveBeenCalledWith(path.join(__dirname, '..', 'views', '401.html'));
        expect(next).not.toHaveBeenCalled();
    });

    // Pozitív teszt: bejelentkezett felhasználó továbbengedése
    test('requireAuthPage allows authenticated users', () => {
        const req = { session: { user: { id: 10 } } };
        const res = createResponse();
        const next = jest.fn();

        requireAuthPage(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.sendFile).not.toHaveBeenCalled();
    });
});
