const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const requestIp = require('request-ip');
const loginMw = require('../middleware/login.middleware.js');
const foodsMw = require('../middleware/foods.middleware.js');
const multer = require('multer');
const upload = multer();

// etrend adatok lekerese
router.get('/data', loginMw.requireAuthApi, async (request, response) => {
    try {
        const userId = request.session.user.id;
        
        const metrics = await db.getUserMetrics(userId);
        const preferences = await db.getUserPreferencesData(userId);
        const allFoods = await db.allFoods();

        return response.status(200).json({
            metrics,
            preferences,
            foods: allFoods
        });
    } catch (error) {
        console.error(error.message);
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - meals', error.message, ip);
        } catch (err) {
            console.error('Logging failed:', err);
        }
        return response.status(500).json({
            message: 'Sikertelen elérés!'
        });
    }
});

// sajat recept letrehozasa
router.post('/new', upload.none(), loginMw.requireAuthApi, foodsMw.validateNewFood, async (request, response) => {
    try {
        const userId = request.session.user.id;
        const food = request.body;
        
        const foodId = await db.createUserFood(userId, food);
        for (let allergen of food.allergens) {
            await db.insertFoodAllergen(foodId, allergen);
        }
        
        const ip = requestIp.getClientIp(request);
        await db.log_id(
            userId,
            'meals - food create',
            'created user food id: ' + foodId + ' | name: ' + food.name,
            ip
        );
        
        return response.status(200).json({
            message: 'Sikeres hozzáadás',
            foodId
        });
    } catch (error) {
        console.error(error.message);
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - meals', error.message, ip);
        } catch (err) {
            console.error('Logging failed:', err);
        }
        return response.status(500).json({
            message: 'Sikertelen elérés!'
        });
    }
});

// sajat recept torlese
router.delete('/delete/:id', loginMw.requireAuthApi, async (request, response) => {
    try {
        const id = request.params.id;
        const userId = request.session.user.id;

        const deletedRows = await db.deleteUserFood(id, userId);
        
        if (deletedRows === 0) {
            return response.status(404).json({
                message: 'Étel nem található, vagy nincs jogosultságod törölni!'
            });
        }

        const ip = requestIp.getClientIp(request);
        await db.log_id(
            userId,
            'meals - food delete',
            'deleted user food id: ' + id,
            ip
        );

        return response.status(200).json({
            message: 'Étel sikeresen törölve!'
        });
    } catch (error) {
        console.error(error.message);
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - meals', error.message, ip);
        } catch (err) {
            console.error('Logging failed:', err);
        }
        return response.status(500).json({
            message: 'Sikertelen elérés!'
        });
    }
});

// recept megosztasa
router.post('/share/:id', loginMw.requireAuthApi, async (request, response) => {
    try {
        const foodId = request.params.id;
        const userId = request.session.user.id;
        const { foodName } = request.body;

        await db.createShareTicket(userId, foodId, foodName || 'Ismeretlen étel');

        const ip = requestIp.getClientIp(request);
        await db.log_id(
            userId,
            'meals - food share ticket',
            'requested approval for food id: ' + foodId,
            ip
        );

        return response.status(200).json({
            message: 'Recept sikeresen beküldve jóváhagyásra!'
        });
    } catch (error) {
        console.error(error.message);
        const ip = requestIp.getClientIp(request);
        try {
            await db.log_error('Server error - meals', error.message, ip);
        } catch (err) {
            console.error('Logging failed:', err);
        }
        return response.status(500).json({
            message: 'Sikertelen elérés!'
        });
    }
});

module.exports = router;
