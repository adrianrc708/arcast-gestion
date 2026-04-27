const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { requiredAuth, authorize } = require('../../common/auth.middleware');

router.get('/me', requiredAuth, userController.getMe);
router.get('/recommendations', requiredAuth, userController.getRecommendations);

router.get('/', requiredAuth, authorize(['admin', 'boss']), userController.getAllUsers);

router.post('/progress', requiredAuth, userController.updateProgress);

// ✅ VISTA JEFE: Solo accesible por 'boss' o 'admin' para ver métricas
router.get('/stats', requiredAuth, authorize(['boss', 'admin']), userController.getBossStats);

module.exports = router;