// Tesztfájl betöltéséhez
const fs = require('fs');
const path = require('path');

// Frontend API helper izolált betöltése
const defineApiHelpers = (filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    const transformed = source.replace(/export async function (\w+)/g, 'async function $1');
    const api = {};
    const wrapper = new Function('__IMPORT__', 'exports', `${transformed}\nObject.assign(exports, {registration, login, updateProfile, userAns, getFetch, deleteFetch, postNewPlan, putPlan, putForm, patchFetch, postRequest, postLogout, postForm});`);
    wrapper({}, api);
    return api;
};

describe('Frontend API helper', () => {
    // Fetch mock
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Pozitív teszt: GET helper helyes fejléc és JSON parse
    test('getFetch sends GET request with correct headers and parses JSON', async () => {
        const responseData = { message: 'OK' };
        // Mock fetch válasz
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => responseData
        });

        // API helper betöltése
        const { getFetch } = defineApiHelpers(path.resolve(__dirname, '../javascript/api.js'));
        const result = await getFetch('/api/test');

        // Elvárt eredmény: fetch GET és visszaadott JSON
        expect(global.fetch).toHaveBeenCalledWith('/api/test', {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });
        expect(result).toEqual(responseData);
    });

    // Pozitív teszt: POST helper JSON body-val
    test('postNewPlan sends POST request with JSON body', async () => {
        const payload = { name: 'New Plan' };
        // Mock fetch válasz
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true })
        });

        const { postNewPlan } = defineApiHelpers(path.resolve(__dirname, '../javascript/api.js'));
        const result = await postNewPlan('/api/plans', payload);

        expect(global.fetch).toHaveBeenCalledWith('/api/plans', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(payload)
        });
        expect(result).toEqual({ success: true });
    });

    // Negatív teszt: hibás DELETE válasz kivételt dob
    test('deleteFetch throws when response is not ok', async () => {
        // Mock fetch hibás válasz
        global.fetch.mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Delete failed', error: ['delete'] })
        });

        const { deleteFetch } = defineApiHelpers(path.resolve(__dirname, '../javascript/api.js'));

        // Elvárt eredmény: kivétel dobása
        await expect(deleteFetch('/api/item/1')).rejects.toThrow('Delete failed');
        expect(global.fetch).toHaveBeenCalledWith('/api/item/1', {
            method: 'DELETE',
            headers: { 'Content-type': 'application/json' }
        });
    });
});
