const express = require('express');
const router = express.Router();
const controller = require('../controllers/movies.controller');

// API Endpoints para Películas
router.get('/', controller.getAllMovies);
router.post('/', controller.createMovie);
router.get('/:id', controller.getMovieById);

module.exports = router;