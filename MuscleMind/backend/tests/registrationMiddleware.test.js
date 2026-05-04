// Adatbázis mock
const mockDb = {
    username_exist: jest.fn(),
    email_exist: jest.fn()
};

jest.mock('../sql/database.js', () => mockDb);

// Regisztrációs middleware importálása
const validateRegistration = require('../middleware/registration.middleware');

function createResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
}

describe('Registration middleware', () => {
    // Mockok alaphelyzetbe állítása
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Pozitív teszt: helyes regisztrációs adat
    test('Allows valid registration payload', async () => {
        // Helyes regisztrációs bemenet
        const req = {
            body: {
                firstN: 'Teszt',
                lastN: 'Felhasznalo',
                userN: 'tesztuser',
                email: 'teszt@example.com',
                pass: 'ValidPass1!'
            }
        };
        const res = createResponse();
        const next = jest.fn();

        // Mock adatbázis válaszok
        mockDb.username_exist.mockResolvedValue(0);
        mockDb.email_exist.mockResolvedValue(0);

        // Middleware futtatása
        await validateRegistration(req, res, next);

        // Elvárt eredmény: next() és nincs státusz
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // Negatív teszt: hiányos regisztrációs adatok
    test('Rejects missing required fields', async () => {
        // Hiányzó mező
        const req = {
            body: {
                firstN: 'Teszt',
                lastN: 'Felhasznalo',
                userN: 'tesztuser',
                email: ''
            }
        };
        const res = createResponse();
        const next = jest.fn();

        // Middleware futtatása
        await validateRegistration(req, res, next);

        // Elvárt eredmény: 400 és hibaüzenet
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Hiányzó vagy érvénytelen mezők'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('Rejects invalid email format', async () => {
        const req = {
            body: {
                firstN: 'Teszt',
                lastN: 'Felhasznalo',
                userN: 'tesztuser',
                email: 'bad-email',
                pass: 'ValidPass1!'
            }
        };
        const res = createResponse();
        const next = jest.fn();

        await validateRegistration(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Érvénytelen adat(ok)',
            id: 2
        }));
        expect(next).not.toHaveBeenCalled();
    });
});
