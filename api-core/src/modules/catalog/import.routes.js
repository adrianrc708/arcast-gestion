const express = require('express');
const router = express.Router();
const controller = require('./import.controller');
const { requiredAuth, authorize } = require('../../common/auth.middleware');

router.post('/movie', requiredAuth, authorize(['admin', 'boss']), controller.importMovie);
router.post('/tv', requiredAuth, authorize(['admin', 'boss']), controller.importTVShow);
router.post('/bulk-peru', requiredAuth, authorize(['admin', 'boss']), controller.importPeruvianMovies);

module.exports = router;