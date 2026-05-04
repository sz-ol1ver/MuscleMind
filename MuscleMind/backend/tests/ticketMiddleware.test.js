// Adatbázis mock
const mockDb = {
    limitTicketCreation: jest.fn(),
    findTicketEmail: jest.fn(),
    findPreId: jest.fn()
};

jest.mock('../sql/database.js', () => mockDb);

// Ticket middleware importálása
const { validateTicket } = require('../middleware/ticket.middleware');

function createResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
}

describe('Ticket middleware', () => {
    // Mockok alaphelyzetbe állítása
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Pozitív teszt: helyes ticket adat
    test('Allows valid ticket payload', async () => {
        // Helyes ticket bemenet
        const req = {
            session: { user: { id: 1 } },
            body: {
                email: 'test@example.com',
                category: 'idea',
                subject: 'Jó ötlet',
                preId: '1',
                message: 'Ez egy teszt üzenet.'
            }
        };
        const res = createResponse();
        const next = jest.fn();

        // Mock adatbázis válaszok
        mockDb.limitTicketCreation.mockResolvedValue(0);
        mockDb.findTicketEmail.mockResolvedValue('test@example.com');
        mockDb.findPreId.mockResolvedValue([1]);

        // Middleware futtatása
        await validateTicket(req, res, next);

        // Elvárt eredmény: next()
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // Negatív teszt: üres üzenet tiltása
    test('Rejects empty message field', async () => {
        // Üres ticket üzenet
        const req = {
            session: { user: { id: 1 } },
            body: {
                email: 'test@example.com',
                category: 'idea',
                subject: 'Tárgy',
                preId: '1',
                message: '   '
            }
        };
        const res = createResponse();
        const next = jest.fn();

        // Mock adatbázis válaszok
        mockDb.limitTicketCreation.mockResolvedValue(0);
        mockDb.findTicketEmail.mockResolvedValue('test@example.com');
        mockDb.findPreId.mockResolvedValue([1]);

        // Middleware futtatása
        await validateTicket(req, res, next);

        // Elvárt eredmény: 400 és hibaüzenet
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Hibás adatok!'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('Rejects invalid category', async () => {
        const req = {
            session: { user: { id: 1 } },
            body: {
                email: 'test@example.com',
                category: 'invalid',
                subject: 'Tárgy',
                preId: '1',
                message: 'Üzenet'
            }
        };
        const res = createResponse();
        const next = jest.fn();

        mockDb.limitTicketCreation.mockResolvedValue(0);
        mockDb.findTicketEmail.mockResolvedValue('test@example.com');
        mockDb.findPreId.mockResolvedValue([1]);

        await validateTicket(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Hibás adatok!'
        }));
        expect(next).not.toHaveBeenCalled();
    });
});
