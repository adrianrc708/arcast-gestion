const SystemConfig = require('./system.model');
const audit = require('../../common/audit.service');

// VISTA ADMIN: Obtener CSS/JS global (Estilo Koha)
exports.getConfig = async (req, res) => {
    try {
        let config = await SystemConfig.findOne({ key: 'global_settings' });
        if (!config) config = await SystemConfig.create({ key: 'global_settings' });
        res.json(config);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// VISTA ADMIN: Inyectar CSS/JS para cambiar la UI sin reiniciar
exports.updateConfig = async (req, res) => {
    const { customCSS, customJS, maintenanceMode } = req.body;
    try {
        const config = await SystemConfig.findOneAndUpdate(
            { key: 'global_settings' },
            { customCSS, customJS, maintenanceMode, updatedBy: req.user.username },
            { upsert: true, new: true }
        );
        // Auditoría obligatoria para cambios de configuración
        await audit.recordMutation(req.user.id, 'SYSTEM_CONFIG_CHANGE', { maintenanceMode }, req.ip);
        res.json(config);
    } catch (err) { res.status(500).json({ message: err.message }); }
};