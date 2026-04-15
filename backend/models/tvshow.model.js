const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TVShowSchema = new Schema({
    name: { type: String, required: true }, // TMDB usa 'name' para series
    overview: { type: String },
    posterUrl: { type: String },
    tmdbId: { type: String, unique: true, required: true },
    firstAirDate: { type: String }
});

module.exports = mongoose.model('TVShow', TVShowSchema);