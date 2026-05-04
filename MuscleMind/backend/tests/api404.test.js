// Supertest import
const request = require('supertest');
// Backend Express app importálása teszthez
const app = require('../app');

describe('API 404 handling', () => {
    // Negatív teszt: nem létező API végpont
    test('Nonexistent API route returns JSON 404 error', async () => {
        // Supertest kérés
        const res = await request(app).get('/api/does-not-exist');

        // Elvárt eredmény
        expect(res.status).toBe(404);
        expect(res.type).toMatch(/json/);
        expect(res.body).toEqual({
            message: 'Az API végpont nem található!'
        });
    });

    // Negatív teszt: nem-API útvonal 404 oldallal
    test('Non-API route returns HTML page 404 content', async () => {
        // Supertest kérés
        const res = await request(app).get('/does-not-exist-page');

        // Elvárt eredmény
        expect(res.type).toMatch(/html/);
        expect(res.text).toContain('Error');
        expect(res.text).toContain('error-code');
    });
});
