const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- 1. ES VITAL CREAR ESTE SUB-SCHEMA ---
const WatchlistSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'kind' // Esto le dice a Mongoose: "Busca el modelo en el campo 'kind' de ESTE objeto"
    },
    kind: {
        type: String,
        required: true,
        enum: ['Movie', 'TVShow']
    }
}, { _id: false }); // Evita crear IDs innecesarios para la lista

// --- 2. USAR EL SUB-SCHEMA EN EL USUARIO ---
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },

    // Usamos el esquema definido arriba
    watchlist: [WatchlistSchema]
});

module.exports = mongoose.model('User', UserSchema);