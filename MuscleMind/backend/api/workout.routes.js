const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');
const fs = require('fs/promises');
const requestIp = require('request-ip');
const {userLoggedIn} = require('../middleware/login.middleware.js');

module.exports = router;