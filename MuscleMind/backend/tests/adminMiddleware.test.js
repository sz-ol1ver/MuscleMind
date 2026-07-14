const path = require('path');
// Admin middleware importálása
const { requireAdmin } = require('../middleware/isAdmin.middleware');

function createResponse() {
    return {
        sendFile: jest.fn()
    };
}

describe('Admin middleware', () => {
    // Pozitív teszt: admin továbbengedése
    test('Allows admin user to proceed', async() => {
        // Admin session
        const req = { session: { user: { id:1,admin: 1 } } };
        const res = createResponse();
        const next = jest.fn();

        // Middleware futtatása
        await requireAdmin(req, res, next);

        // Továbbengedés ellenőrzése
        expect(next).toHaveBeenCalled();
        expect(res.sendFile).not.toHaveBeenCalled();
    });

    // Negatív teszt: nem-admin felhasználó tiltása
    test('Blocks non-admin user with 403 page', async() => {
        // Nem admin session
        const req = { session: { user: { id:2, admin: 0 } } };
        const res = createResponse();
        const next = jest.fn();

        // Middleware futtatása
        await requireAdmin(req, res, next);

        // Elvárt eredmény: 403 oldal
        expect(res.sendFile).toHaveBeenCalledWith(path.join(__dirname, '..', 'views', '403.html'));
        expect(next).not.toHaveBeenCalled();
    });

    // Negatív teszt: session nélküli kérés hibakezelése
    test('Session-less request is passed to error handler', async() => {
        // Üres request
        const req = {};
        const res = createResponse();
        const next = jest.fn();

        // Middleware futtatása
        await requireAdmin(req, res, next);

        // Elvárt eredmény: hibával hívott next
        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
});
