const mongoose = require('mongoose');

const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({
    userId: { type: String, required: true },
    action: { type: String, required: true }, // Ej: "CATALOG_IMPORT", "USER_PROFILE_CHANGE"
    details: { type: Object },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now }
}));


exports.recordMutation = async (userId, action, details, ip = 'internal') => {
    try {
        const log = new AuditLog({ userId, action, details, ip });
        await log.save();
        console.log(`[AUDIT] Mutación detectada y registrada: ${action}`);
    } catch (err) {
        console.error("Fallo crítico en el sistema de auditoría:", err.message);
    }
};