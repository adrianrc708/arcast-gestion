const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const { requiredAuth } = require('../middleware/auth.middleware');

// Todas estas rutas requieren estar logueado
router.get('/me', requiredAuth, controller.getMe);
router.put('/me', requiredAuth, controller.updateMe);
router.get('/my-reviews', requiredAuth, controller.getMyReviews);

// ... (código existente) ...
router.post('/me/watchlist', requiredAuth, controller.addToWatchlist);
router.get('/me/watchlist', requiredAuth, controller.getWatchlist);

// NUEVA RUTA
router.delete('/me/watchlist/:itemId', requiredAuth, controller.removeFromWatchlist);

module.exports = router;