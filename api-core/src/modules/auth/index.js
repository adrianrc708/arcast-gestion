const express = require('express');
const authRoutes = require('./auth.routes');

const router = express.Router();

// Este router agrupa todas las sub-rutas de autenticación
router.use('/', authRoutes);

module.exports = router;