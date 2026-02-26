const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const {registrationComplete,validateInput} = require('../middleware/kerdoiv.middleware.js');
router.post('/', registrationComplete, validateInput, async(req, res)=>{
    try {
        console.log(req.body);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;