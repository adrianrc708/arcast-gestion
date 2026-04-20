const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WatchlistSchema = new Schema({
    item: { type: Schema.Types.ObjectId, required: true },
    kind: { type: String, required: true, enum: ['Movie', 'TVShow'] }
}, { _id: false });

// ✅ NUEVO: Esquema para guardar el progreso estilo Netflix
const ProgressSchema = new Schema({
    contentId: { type: String, required: true },
    contentType: { type: String, enum: ['Movie', 'TVShow'] },
    lastTimeWatched: { type: Date, default: Date.now },
    percentWatched: { type: Number, default: 0 }
}, { _id: false });

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },
    watchlist: [WatchlistSchema],
    // ✅ NUEVO: Array de progreso
    watchHistory: [ProgressSchema]
});

module.exports = mongoose.model('User', UserSchema);