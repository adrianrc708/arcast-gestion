const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { requiredAuth } = require('../../common/auth.middleware');

// Rutas Usuario Normal
router.get('/me', requiredAuth, userController.getMe);
router.get('/recommendations', requiredAuth, userController.getRecommendations);
router.post('/progress', requiredAuth, userController.updateProgress);

// ✅ RUTA VISTA JEFE: Analítica
router.get('/stats', requiredAuth, userController.getBossStats);

module.exports = router;