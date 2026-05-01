const db = require('../sql/database.js');
const path = require('path');

async function validateNewFood(req, res, next) {
    try {
        const food = req.body;

        const allowedFood = [
            'name',
            'url',
            'category',
            'description',
            'calories_kcal',
            'protein_g',
            'carbs_g',
            'fat_g',
            'fiber_g',
            'sugar_g',
            'salt_g',
            'serving_size',
            'serving_unit',
            'prep_time_min',
            'goal_tag',
            'diet_tag',
            'difficulty',
            'allergens',
            'high_protein',
            'low_carb',
            'bulk_friendly',
            'cut_friendly'
        ];

        const allowedEnums = {
            category: ['reggeli', 'ebed', 'vacsora', 'snack', 'desszert', 'ital'],
            serving_unit: ['g', 'ml', 'db', 'szelet', 'tal', 'pohar', 'adag'],
            goal_tag: ['mind', 'tomegnoveles', 'szalkasitas', 'szintentartas'],
            diet_tag: ['mindenevo', 'vegetarianus', 'vegan'],
            difficulty: ['konnyu', 'kozepes', 'nehez']
        };

        const allowedAllergens = [1, 2, 3, 4, 5, 6, 7];

        if (!food || typeof food !== 'object' || Array.isArray(food)) {
            return res.status(400).json({
                message: 'Érvénytelen étel adat.'
            });
        }

        const keys = Object.keys(food);

        //? obj keys ellenorzese
        for (let key of keys) {
            if (!allowedFood.includes(key)) {
                return res.status(400).json({
                    message: `Nem megengedett mező: ${key}`
                });
            }
        }
        //? name mezo ellenorzes
        if (typeof food.name !== 'string' || !food.name.trim() || food.name.length > 150) {
            return res.status(400).json({
                message: 'Érvénytelen név.'
            });
        }
        // url ellenorzes
        // if (food.url !== undefined && food.url !== null && typeof food.url !== 'string') {
        //     return res.status(400).json({
        //         message: 'Érvénytelen url.'
        //     });
        // }
        // let urlReg = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
        // if(!urlReg.test(food.url)){
        //     return res.status(400).json({
        //         message: 'Érvénytelen url.'
        //     });
        // }
        //? leiras ellenorzes
        if (typeof food.description !== 'string' || !food.description.trim()) {
            return res.status(400).json({
                message: 'Érvénytelen leírás.'
            });
        }
        //? enum ertek ellenorzes
        for (let key in allowedEnums) {
            if (!allowedEnums[key].includes(food[key])) {
                return res.status(400).json({
                    message: `Érvénytelen ${key}`
                });
            }
        }
        //? szam tipusu adatok ellenorzese
        const numericFields = [
            'calories_kcal',
            'protein_g',
            'carbs_g',
            'fat_g',
            'fiber_g',
            'sugar_g',
            'salt_g',
            'serving_size',
            'prep_time_min'
        ];

        for (let field of numericFields) {
            const value = Number(food[field]);

            if (food[field] === undefined || food[field] === null || Number.isNaN(value) || value < 0) {
                return res.status(400).json({
                    message: `Hibás érték: ${field}`
                });
            }

            food[field] = value;
        }

        const boolFields = [
            'high_protein',
            'low_carb',
            'bulk_friendly',
            'cut_friendly'
        ];

        for (let field of boolFields) {
            if (food[field] === 'on' ||food[field] === true ||food[field] === 'true') {
                food[field] = 1;
            } else {
                food[field] = 0;
            }
        }

        if (food.allergens !== undefined) {
            if (!Array.isArray(food.allergens)) {
                food.allergens = [food.allergens];
            }

            const parsed = [];

            for (let id of food.allergens) {
                const num = Number(id);

                if (!Number.isInteger(num)) {
                    return res.status(400).json({
                        message: `Hibás allergén ID: ${id}`
                    });
                }

                if (!allowedAllergens.includes(num)) {
                    return res.status(400).json({
                        message: `Nem létező allergén: ${num}`
                    });
                }

                parsed.push(num);
            }

            food.allergens = [...new Set(parsed)];
        } else {
            food.allergens = [];
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    validateNewFood
}