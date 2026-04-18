const express = require('express');
const movieRoutes = require('./movies.routes');
const tvshowRoutes = require('./tvshows.routes');
const importRoutes = require('./import.routes'); // Nueva inclusión

const router = express.Router();

router.use('/movies', movieRoutes);
router.use('/tvshows', tvshowRoutes);
router.use('/import', importRoutes); // Ahora vive dentro de catalog

module.exports = router;