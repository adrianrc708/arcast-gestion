const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    userId: { type: String, default: 'system' },
    action: { type: String, required: true }, // Ej: "PROFILE_UPDATE", "REVIEW_CREATED"
    module: { type: String, required: true }, // Ej: "USERS", "REVIEWS"
    severity: { type: String, enum: ['INFO', 'WARN', 'CRITICAL'], default: 'INFO' },
    details: { type: Object },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);