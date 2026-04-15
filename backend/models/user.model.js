const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },

    // --- NUEVO CAMPO ---
    watchlist: [{
        type: Schema.Types.ObjectId,
        ref: 'Movie'
    }]
});

module.exports = mongoose.model('User', UserSchema);