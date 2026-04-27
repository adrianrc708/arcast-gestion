const axios = require('axios');
const { AppError } = require('../../../common/error.utils');


const getMovieDetails = async (id) => {
    try {
        const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            params: { api_key: process.env.TMDB_API_KEY, language: 'es-ES' }
        });
        const d = res.data;

        return {
            title: d.title,
            overview: d.overview,
            posterUrl: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
            backdropUrl: d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : null,
            tmdbId: String(d.id),
            releaseDate: d.release_date,
            voteAverage: d.vote_average
        };
    } catch (err) {
        throw new AppError('Error al conectar con el proveedor TMDB', 502);
    }
};

module.exports = { getMovieDetails };