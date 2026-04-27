const express = require('express');
const router = express.Router();
const controller = require('./import.controller');
const { requiredAuth } = require('../../common/auth.middleware');

// (Opcional: podemos hacer que solo usuarios logueados importen)
// Por ahora lo dejamos protegido

// Verificamos que las funciones existan antes de pasarlas a las rutas
if (typeof controller.importMovie !== 'function') {
  console.warn("ADVERTENCIA: controller.importMovie no es una función.");
}
if (typeof controller.importTVShow !== 'function') {
  console.warn("ADVERTENCIA: controller.importTVShow no es una función.");
}

// Usamos los nombres exactos que exportaba tu código original
router.post('/movie', requiredAuth, controller.importMovie);
router.post('/tv', requiredAuth, controller.importTVShow);

module.exports = router;