const express    = require('express');
const router     = express.Router();
const controller = require('./streaming.controller');
const { requiredAuth } = require('../../common/auth.middleware');

// Película local — autenticación requerida para proteger el contenido
router.get('/movie/:id', requiredAuth, controller.streamMovie);

// Episodio de serie local
router.get('/episode/:tvshowId/:season/:episode', requiredAuth, controller.streamEpisode);

module.exports = router;
