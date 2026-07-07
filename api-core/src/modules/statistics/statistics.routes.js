const express = require('express');
const router = express.Router();
const statisticsController = require('./statistics.controller');

// Middleware de autenticación y autorización (nombres reales del proyecto)
const { requiredAuth, authorize } = require('../../common/auth.middleware');

const adminOnly = [requiredAuth, authorize(['admin', 'boss'])];

// Solo los admins y bosses pueden ver las métricas
router.get('/traffic', ...adminOnly, statisticsController.getTrafficMetrics);
router.get('/playback', ...adminOnly, statisticsController.getPlaybackMetrics);

// Ruta para registrar el tiempo consumido por el usuario
// Cualquier usuario logueado puede registrar su propio tiempo
router.post('/playback', requiredAuth, statisticsController.recordPlayback);

module.exports = router;
