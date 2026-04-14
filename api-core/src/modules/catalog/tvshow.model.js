const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TVShowSchema = new Schema({
    name: { type: String, required: true },
    overview: { type: String },
    posterUrl: { type: String },
    backdropUrl: { type: String },
    tmdbId: { type: String, unique: true, required: true },
    firstAirDate: { type: String },
    genres: [{ type: String }],
    trailerKey: { type: String },
    voteAverage: { type: Number },
    seasons: { type: Number },
    languages: [{ type: String }],

    // CAMBIO: Array de plataformas
    platforms: [{
        name: String,
        logo: String,
        link: String
    }],

    watchLink: { type: String }
});

module.exports = mongoose.model('TVShow', TVShowSchema);