const express = require('express');
const router = express.Router();
const controller = require('./movies.controller');
const { requiredAuth, authorize } = require('../../common/auth.middleware');

// API Endpoints para Películas
router.get('/', controller.getAllMovies);
router.post('/', requiredAuth, authorize(['admin', 'boss']), controller.createMovie);
router.get('/:id', controller.getMovieById);
router.put('/:id', requiredAuth, authorize(['admin', 'boss']), controller.updateMovie);
router.delete('/:id', requiredAuth, authorize(['admin', 'boss']), controller.deleteMovie);

module.exports = router;