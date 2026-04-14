const express = require('express');
const router = express.Router();
const controller = require('./tvshows.controller');
const { requiredAuth, authorize } = require('../../common/auth.middleware');

router.get('/', controller.getAllTVShows);
router.get('/:id', controller.getTVShowById);
router.post('/', requiredAuth, authorize(['admin', 'boss']), controller.createTVShow);
router.put('/:id', requiredAuth, authorize(['admin', 'boss']), controller.updateTVShow);
router.delete('/:id', requiredAuth, authorize(['admin', 'boss']), controller.deleteTVShow);

module.exports = router;