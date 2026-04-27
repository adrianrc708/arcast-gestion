const express = require('express');
const router = express.Router();
const controller = require('./import.controller');

// ✅ IMPORTANTE: Revisa que auth.middleware siga existiendo en src/common/
// Si lo moviste, ajusta esta ruta. Si no, debería funcionar así:
const { requiredAuth } = require('../../common/auth.middleware');

// Verificamos que las funciones existan antes de pasarlas a las rutas
if (typeof controller.importMovie !== 'function') {
  console.warn("ADVERTENCIA: controller.importMovie no es una función. Revisa los nombres exportados en import.controller.js");
}
if (typeof controller.importTVShow !== 'function') {
  console.warn("ADVERTENCIA: controller.importTVShow no es una función. Revisa los nombres exportados en import.controller.js");
}

// Usamos los nombres exactos que exporta tu import.controller.js
router.post('/movie', requiredAuth, controller.importMovie);
router.post('/tv', requiredAuth, controller.importTVShow);

module.exports = router;