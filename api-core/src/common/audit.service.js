const mongoose = require('mongoose');

// Definimos el modelo aquí mismo para no crear archivos extra si tienes prisa
const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({
    userId: { type: String, required: true },
    action: { type: String, required: true }, // Ej: "CATALOG_MUTATION", "SENSITIVE_DATA_CHANGE"
    details: { type: Object },
    timestamp: { type: Date, default: Date.now }
}));

/**
 * Registra cambios estructurales en el sistema (Calidad ISO 25010)
 */
exports.recordMutation = async (userId, action, details) => {
    try {
        const log = new AuditLog({ userId, action, details });
        await log.save();
        console.log(`[AUDIT] Acción crítica registrada: ${action}`);
    } catch (err) {
        console.error("Error en sistema de auditoría:", err);
    }
};