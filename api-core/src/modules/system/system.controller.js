/** @type {any} */
const SystemConfig = require('./system.model');
/** @type {any} */
const AuditLog = require('../../common/audit.model');
const audit = require('../../common/audit.service');
const { catchAsync } = require('../../common/error.utils');

exports.getConfig = catchAsync(async (req, res, _next) => {
    // noinspection JSUnresolvedFunction
    let config = await SystemConfig.findOne({ key: 'global_settings' });
    if (!config) {
        // noinspection JSUnresolvedFunction
        config = await SystemConfig.create({ key: 'global_settings' });
    }
    res.json(config);
});

exports.updateConfig = catchAsync(async (req, res, _next) => {
    const { customCSS, customJS, maintenanceMode } = req.body;
    // noinspection JSUnresolvedFunction
    const config = await SystemConfig.findOneAndUpdate(
        { key: 'global_settings' },
        { customCSS, customJS, maintenanceMode, updatedBy: req.user.username },
        /** @type {any} */ ({ upsert: true, new: true })
    );

    await audit.recordMutation(req.user.id, 'SYSTEM_UI_MUTATION', { maintenance: maintenanceMode }, req.ip);
    res.json(config);
});
exports.getAuditLogs = catchAsync(async (req, res, _next) => {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    // noinspection JSUnresolvedFunction
    const logs = await AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
    res.json(logs);
});