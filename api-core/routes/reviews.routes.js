const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviews.controller');
const { optionalAuth, requiredAuth } = require('../middleware/auth.middleware');

// API Endpoints
router.get('/', controller.getAllReviews);
router.get('/:movieId', controller.getReviewsByMovie);

// Crear reseña: Autenticación es OPCIONAL
router.post('/', optionalAuth, controller.createReview);

// Editar y Eliminar: Autenticación es REQUERIDA
router.put('/:id', requiredAuth, controller.updateReview);
router.delete('/:id', requiredAuth, controller.deleteReview);

module.exports = router;