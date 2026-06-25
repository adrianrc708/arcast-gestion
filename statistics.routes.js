const express = require('express');
const router = express.Router();
const statisticsController = require('./statistics.controller');

// Middleware de autenticación y autorización
const { protect, restrictTo } = require('../../common/auth.middleware'); // Asegúrate que la ruta sea correcta

// Solo los admins y bosses pueden ver las métricas
router.get('/traffic', protect, restrictTo('admin', 'boss'), statisticsController.getTrafficMetrics);
router.get('/playback', protect, restrictTo('admin', 'boss'), statisticsController.getPlaybackMetrics);

// Ruta para registrar el tiempo consumido por el usuario
// Cualquier usuario logueado puede registrar su propio tiempo
router.post('/playback', protect, statisticsController.recordPlayback);

module.exports = router;