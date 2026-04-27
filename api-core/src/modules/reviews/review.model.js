const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    movieId: { type: String, required: true },
    movieTitle: { type: String, required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: Date, default: Date.now },
    // ✅ ELIMINADO 'ref: User': Los módulos no comparten esquemas para ser independientes.
    userId: { type: Schema.Types.ObjectId, required: false },
    contentType: { type: String, default: 'movie' }
});

module.exports = mongoose.model('Review', ReviewSchema);