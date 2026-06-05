const mongoose = require('mongoose');

const playbackLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentId: { type: String, required: true },
    contentType: { type: String, enum: ['Movie', 'TVShow'] },
    durationMinutes: { type: Number, required: true }, // Minutos de consumo en esta sesión
    timestamp: { type: Date, default: Date.now }
});

// Índice compuesto para optimizar las agregaciones por fecha
playbackLogSchema.index({ timestamp: 1 });

module.exports = mongoose.model('PlaybackLog', playbackLogSchema);