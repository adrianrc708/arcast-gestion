const express = require('express');
const router = express.Router();
const systemController = require('./system.controller');
const { requiredAuth, authorize } = require('../../common/auth.middleware');

// El Admin puede ver y editar la configuración global (CSS/JS)
router.get('/config', requiredAuth, authorize(['admin']), systemController.getConfig);
router.put('/config', requiredAuth, authorize(['admin']), systemController.updateConfig);

module.exports = router;