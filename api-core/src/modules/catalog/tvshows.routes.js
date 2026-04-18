const express = require('express');
const router = express.Router();
const controller = require('./tvshows.controller');

router.get('/', controller.getAllTVShows);
router.get('/:id', controller.getTVShowById);

module.exports = router;