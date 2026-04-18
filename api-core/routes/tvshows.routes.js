const express = require('express');
const router = express.Router();
const controller = require('../src/modules/catalog/tvshows.controller');

router.get('/', controller.getAllTVShows);
router.get('/:id', controller.getTVShowById);

module.exports = router;