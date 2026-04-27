const express = require('express');
const router = express.Router();
const reviewsController = require('./reviews.controller');
const { requiredAuth } = require('../../common/auth.middleware');

router.get('/', reviewsController.getAllReviews);
router.get('/movie/:movieId', reviewsController.getReviewsByMovie);
router.post('/', requiredAuth, reviewsController.createReview);
router.put('/:id', requiredAuth, reviewsController.updateReview);
router.delete('/:id', requiredAuth, reviewsController.deleteReview);

module.exports = router;