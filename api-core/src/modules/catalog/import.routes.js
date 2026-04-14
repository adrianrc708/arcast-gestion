const express = require('express');
const router = express.Router();
const controller = require('./import.controller');
const { requiredAuth } = require('../../common/auth.middleware');

router.post('/movie', requiredAuth, controller.importMovie);
router.post('/tv', requiredAuth, controller.importTVShow);

module.exports = router;