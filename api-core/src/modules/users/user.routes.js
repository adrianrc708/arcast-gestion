const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { requiredAuth } = require('../../common/auth.middleware');

// ✅ Asegúrate de que userController tenga estas funciones
router.get('/me', requiredAuth, userController.getMe);
router.put('/me', requiredAuth, userController.updateMe);
router.get('/my-reviews', requiredAuth, userController.getMyReviews);

router.get('/watchlist', requiredAuth, userController.getWatchlist);
router.post('/watchlist', requiredAuth, userController.addToWatchlist);
router.delete('/watchlist/:itemId', requiredAuth, userController.removeFromWatchlist);

module.exports = router;