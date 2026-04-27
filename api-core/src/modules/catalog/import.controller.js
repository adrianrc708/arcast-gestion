const Movie = require('./movie.model');
const TVShow = require('./tvshow.model');
const axios = require('axios');

// ✅ Normalizamos los nombres de las funciones
exports.importMovie = async (req, res) => {
    const { tmdbId } = req.body;
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
            params: { api_key: process.env.TMDB_API_KEY, language: 'es-ES' }
        });
        const movie = new Movie({
            title: response.data.title,
            description: response.data.overview,
            posterPath: response.data.poster_path,
            releaseDate: response.data.release_date,
            voteAverage: response.data.vote_average,
            tmdbId: response.data.id
        });
        await movie.save();
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
        const tvShow = new TVShow({
            name: response.data.name,
            description: response.data.overview,
            posterPath: response.data.poster_path,
            firstAirDate: response.data.first_air_date,
            voteAverage: response.data.vote_average,
            tmdbId: response.data.id
        });
        await tvShow.save();
        res.json(tvShow);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};