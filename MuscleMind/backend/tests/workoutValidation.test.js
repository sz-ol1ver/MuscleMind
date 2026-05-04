// Adatbázis mock
const mockDb = {
    exerciseExist: jest.fn()
};

jest.mock('../sql/database.js', () => mockDb);

// Edzésterv middleware importálása
const { validateNewPlan } = require('../middleware/workout.middleware');

function createResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
}

describe('Workout validation middleware', () => {
    // Mockok alaphelyzetbe állítása
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const validPlan = {
        name: 'Teljes test',
        days: [
            {
                dayNumber: 1,
                name: 'Hétfő',
                restDay: false,
                exercises: [
                    { exerciseId: 1, name: 'Guggolás', order: 1 }
                ]
            }
        ]
    };

    // Pozitív teszt: érvényes edzésterv elfogadása
    test('Accepts a valid new workout plan', async () => {
        // Érvényes edzésterv
        const req = { body: validPlan };
        const res = createResponse();
        const next = jest.fn();

        // Mock adatbázis válasz
        mockDb.exerciseExist.mockResolvedValue(true);

        // Middleware futtatása
        await validateNewPlan(req, res, next);

        // Elvárt eredmény: next()
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // Negatív teszt: napok egyediségének ellenőrzése
    test('Rejects duplicate day numbers in workout days', async () => {
        // Duplikált napok
        const req = {
            body: {
                name: 'Test terv',
                days: [
                    { dayNumber: 1, name: 'Hétfő', restDay: false, exercises: [{ exerciseId: 1, name: 'Guggolás', order: 1 }] },
                    { dayNumber: 1, name: 'Kedd', restDay: false, exercises: [{ exerciseId: 2, name: 'Fekvenyomás', order: 1 }] }
                ]
            }
        };
        const res = createResponse();
        const next = jest.fn();

        // Mock adatbázis válasz
        mockDb.exerciseExist.mockResolvedValue(true);

        // Middleware futtatása
        await validateNewPlan(req, res, next);

        // Elvárt eredmény: 400 és hibaüzenet
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Napok adatainak feldolgozása sikertelen!'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('Rejects duplicate exercise IDs within one day', async () => {
        // Duplikált gyakorlatok
        const req = {
            body: {
                name: 'Test terv',
                days: [
                    {
                        dayNumber: 1,
                        name: 'Hétfő',
                        restDay: false,
                        exercises: [
                            { exerciseId: 1, name: 'Guggolás', order: 1 },
                            { exerciseId: 1, name: 'Guggolás', order: 2 }
                        ]
                    }
                ]
            }
        };
        const res = createResponse();
        const next = jest.fn();

        mockDb.exerciseExist.mockResolvedValue(true);

        await validateNewPlan(req, res, next);

        // Elvárt eredmény: 400 és duplikációs hiba
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Duplikáció a gyakorlatok között!'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('Rejects workout plan missing required fields', async () => {
        // Hiányos edzésterv
        const req = { body: { name: '', days: [] } };
        const res = createResponse();
        const next = jest.fn();

        // Middleware futtatása
        await validateNewPlan(req, res, next);

        // Elvárt eredmény: 400 és név kérése
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Adj nevet az edzéstervnek.'
        }));
        expect(next).not.toHaveBeenCalled();
    });
});
