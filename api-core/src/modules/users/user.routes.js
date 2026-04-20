const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { requiredAuth } = require('../../common/auth.middleware');

router.get('/me', requiredAuth, userController.getMe);

// Rutas de Watchlist
router.get('/watchlist', requiredAuth, userController.getWatchlist);
router.post('/watchlist', requiredAuth, userController.addToWatchlist);
router.delete('/watchlist/:itemId', requiredAuth, userController.removeFromWatchlist);

// ✅ NUEVAS RUTAS ESTILO NETFLIX
router.get('/recommendations', requiredAuth, userController.getRecommendations);
router.post('/progress', requiredAuth, userController.updateProgress);

module.exports = router;