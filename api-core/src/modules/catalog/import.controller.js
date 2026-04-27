/**
 * @type {any}
 */
const Movie = require('./movie.model');
/** @type {any} */
const TVShow = require('./tvshow.model');
const axios = require('axios');
const audit = require('../../common/audit.service');

/**

 * @typedef {Object} TMDBResponse
 * @property {string} [title] - Título para películas
 * @property {string} [name] - Nombre para series
 * @property {string} overview
 * @property {string} poster_path
 * @property {string} [release_date]
 * @property {string} [first_air_date]
 * @property {number} vote_average
 * @property {number} id
 */

exports.importMovie = async (req, res) => {
    const { tmdbId } = req.body;
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
            params: { api_key: process.env.TMDB_API_KEY, language: 'es-ES' }
        });

        /** @type {TMDBResponse} */
        const data = response.data;

        const movie = new Movie({
            title: data.title,
            description: data.overview,
            posterPath: data.poster_path,
            releaseDate: data.release_date,
            voteAverage: data.vote_average,
            tmdbId: data.id
        });

        await movie.save();

        await audit.recordMutation(req.user.id, 'CATALOG_IMPORT_MOVIE', {
            id: movie._id,
            tmdbId: movie.tmdbId,
            title: movie.title
        }, req.ip);

        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.importTVShow = async (req, res) => {
    const { tmdbId } = req.body;
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${tmdbId}`, {
            params: { api_key: process.env.TMDB_API_KEY, language: 'es-ES' }
        });

        /** @type {TMDBResponse} */
        const data = response.data;

        const tvShow = new TVShow({
            name: data.name,
            description: data.overview,
            posterPath: data.poster_path,
            firstAirDate: data.first_air_date,
            voteAverage: data.vote_average,
            tmdbId: data.id
        });

        await tvShow.save();

        await audit.recordMutation(req.user.id, 'CATALOG_IMPORT_TV', {
            id: tvShow._id,
            tmdbId: tvShow.tmdbId,
            name: tvShow.name
        }, req.ip);

        res.json(tvShow);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};