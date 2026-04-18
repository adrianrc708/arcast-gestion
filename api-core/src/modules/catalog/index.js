const express = require('express');
const movieRoutes = require('./movies.routes');
const tvshowRoutes = require('./tvshows.routes');

const router = express.Router();

router.use('/movies', movieRoutes);
router.use('/tvshows', tvshowRoutes);

module.exports = router;