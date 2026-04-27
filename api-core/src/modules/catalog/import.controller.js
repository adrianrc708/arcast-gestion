const Movie = require('./movie.model');
const TVShow = require('./tvshow.model');
const axios = require('axios');

// Renombramos las funciones para que coincidan con lo que piden las rutas
exports.importMovie = async (req, res) => {
    const { tmdbId } = req.body;
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
            params: { api_key: process.env.TMDB_API_KEY, language: 'es-ES' }
        });
        const movieData = response.data;
        const movie = new Movie({
            title: movieData.title,
            description: movieData.overview,
            posterPath: movieData.poster_path,
            releaseDate: movieData.release_date,
            voteAverage: movieData.vote_average,
            tmdbId: movieData.id
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
        const tvData = response.data;
        const tvShow = new TVShow({
            name: tvData.name,
            description: tvData.overview,
            posterPath: tvData.poster_path,
            firstAirDate: tvData.first_air_date,
            voteAverage: tvData.vote_average,
            tmdbId: tvData.id
        });
        await tvShow.save();
        res.json(tvShow);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};