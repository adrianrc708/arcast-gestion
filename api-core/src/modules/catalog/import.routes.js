const express = require('express');
const router = express.Router();
const controller = require('../../../controllers/import.controller');
const { requiredAuth } = require('../../../middleware/auth.middleware');

// (Opcional: podemos hacer que solo usuarios logueados importen)
// Por ahora lo dejamos protegido
router.post('/movie', requiredAuth, controller.importMovie);
router.post('/tv', requiredAuth, controller.importTVShow);

module.exports = router;