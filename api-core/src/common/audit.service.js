const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: Object },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now }
});

/** @type {any} */
const AuditLog = mongoose.model('AuditLog', auditSchema);

/**
 * @param {string} userId - ID del usuario que realiza la acción
 * @param {string} action - Nombre de la acción (Ejem: CATALOG_IMPORT)
 * @param {Object} details - Datos relevantes del cambio
 * @param {string} [ip] - Dirección IP del solicitante
 */
exports.recordMutation = async (userId, action, details, ip = 'internal') => {
    try {
        const log = new AuditLog({ userId, action, details, ip });
        await log.save();
        console.log(`[AUDIT] Mutación registrada: ${action}`);
    } catch (err) {
        console.error("Fallo crítico en el sistema de auditoría:", err.message);
    }
};