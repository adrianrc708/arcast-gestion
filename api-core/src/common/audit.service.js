const mongoose = require('mongoose');

// Definimos el modelo de auditoría para cambios de estado (Mutaciones)
const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({
    userId: { type: String, required: true },
    action: { type: String, required: true }, // Ej: "CATALOG_IMPORT", "USER_PROFILE_CHANGE"
    details: { type: Object },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now }
}));

/**
 * Calidad ISO 25010: Trazabilidad.
 * Registra únicamente cambios críticos en la base de datos.
 */
exports.recordMutation = async (userId, action, details, ip = 'internal') => {
    try {
        const log = new AuditLog({ userId, action, details, ip });
        await log.save();
        console.log(`[AUDIT] Mutación detectada y registrada: ${action}`);
    } catch (err) {
        console.error("Fallo crítico en el sistema de auditoría:", err.message);
    }
};