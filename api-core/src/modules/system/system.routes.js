const express = require('express');
const router = express.Router();
const systemController = require('./system.controller');
const { requiredAuth, authorize } = require('../../common/auth.middleware');

// Cualquiera puede ver la config (para que el front aplique el CSS), pero solo admin edita
router.get('/config', systemController.getConfig);
router.put('/config', requiredAuth, authorize(['admin']), systemController.updateConfig);

module.exports = router;