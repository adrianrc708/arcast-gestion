const express = require('express');

/**
 * @type {import('express').Router}
 */
const movieRoutes = (/** @type {any} */ (require('./movies.routes')));

/** @type {import('express').Router} */
const tvshowRoutes = (/** @type {any} */ (require('./tvshows.routes')));

/** @type {import('express').Router} */
const importRoutes = (/** @type {any} */ (require('./import.routes')));

const router = express.Router();

router.use('/movies', movieRoutes);
router.use('/tvshows', tvshowRoutes);
router.use('/import', importRoutes);

module.exports = router;