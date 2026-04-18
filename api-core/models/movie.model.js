const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    title: { type: String, required: true },
    overview: { type: String },
    posterUrl: { type: String },
    backdropUrl: { type: String },
    tmdbId: { type: String, unique: true, required: true },
    releaseDate: { type: String },
    genres: [{ type: String }],
    trailerKey: { type: String },
    voteAverage: { type: Number },
    duration: { type: Number },
    languages: [{ type: String }],

    // CAMBIO: Ahora guardamos un array de plataformas
    platforms: [{
        name: String,
        logo: String,
        link: String
    }],

    // Mantenemos un link principal por compatibilidad si se necesita
    watchLink: { type: String }
});

module.exports = mongoose.model('Movie', MovieSchema);