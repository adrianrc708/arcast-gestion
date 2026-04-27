const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // ✅ SOPORTE PARA 3 VISTAS: Definimos roles claros
    role: {
        type: String,
        enum: ['user', 'admin', 'boss'],
        default: 'user'
    },
    watchlist: [{
        item: { type: Schema.Types.ObjectId, required: true },
        kind: { type: String, enum: ['Movie', 'TVShow'] }
    }],
    watchHistory: [{
        contentId: String,
        percentWatched: Number,
        lastTimeWatched: { type: Date, default: Date.now }
    }],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);