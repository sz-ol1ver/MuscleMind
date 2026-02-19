const express = require('express');
const { registration_insert } = require('../sql/database');
const router = express.Router();

router.post('/', async(request, response) => {
    try {
        const data = request.body;
        //const insert = await registration_insert(data.firstN, data.lastN, data.userN, data.email, data.pass);
        //console.log(insert)
    } catch (error) {
        console.log(error.message)
        response.status(500).json({
            response: 'Sikertelen eleres!',
            error: error.message
        })
    }
});

module.exports = router;