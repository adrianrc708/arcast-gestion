/**
 * @type {any}
 */
const SystemConfig = require('./system.model');
const audit = require('../../common/audit.service');

/**
 * @typedef {Object} ConfigDoc
 * @property {string} key
 * @property {string} customCSS
 * @property {string} customJS
 * @property {boolean} maintenanceMode
 * @property {string} updatedBy
 * @property {function(): Promise<ConfigDoc>} save
 */

/**
 * VISTA ADMIN: Obtener configuración global (CSS/JS)
 */
exports.getConfig = async (req, res) => {
    try {
        // noinspection JSUnresolvedFunction
        let config = await SystemConfig.findOne({ key: 'global_settings' });

        if (!config) {
            // noinspection JSUnresolvedFunction
            config = await SystemConfig.create({ key: 'global_settings' });
        }

        res.json(config);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * VISTA ADMIN: Inyectar código CSS/JS (Estilo Koha)
 */
exports.updateConfig = async (req, res) => {
    const { customCSS, customJS, maintenanceMode } = req.body;
    try {
        // noinspection JSUnresolvedFunction
        const config = await SystemConfig.findOneAndUpdate(
            { key: 'global_settings' },
            { customCSS, customJS, maintenanceMode, updatedBy: req.user.username },
            /** @type {any} */ ({ upsert: true, new: true })
        );

        await audit.recordMutation(req.user.id, 'SYSTEM_UI_MUTATION', {
            maintenance: maintenanceMode,
            cssChanged: !!customCSS
        }, req.ip);

        res.json(config);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};