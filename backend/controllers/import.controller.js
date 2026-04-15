const axios = require('axios');
const Movie = require('../models/movie.model');
const TVShow = require('../models/tvshow.model');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_URL = 'https://image.tmdb.org/t/p/w500'; // URL base para imágenes

// Importar una PELÍCULA
exports.importMovie = async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Se requiere un título' });
    }

    try {
        // 1. Buscar la película en TMDB
        const searchResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: { api_key: TMDB_API_KEY, query: title, language: 'es-ES' }
        });

        if (searchResponse.data.results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron películas con ese título.' });
        }

        // 2. Tomar el primer resultado (el más relevante)
        const tmdbMovie = searchResponse.data.results[0];

        // 3. Verificar si ya existe en nuestra DB por tmdbId
        let movie = await Movie.findOne({ tmdbId: tmdbMovie.id });
        if (movie) {
            return res.status(400).json({ message: 'Esa película ya fue importada.' });
        }

        // 4. Crear y guardar la nueva película en nuestra DB
        movie = new Movie({
            title: tmdbMovie.title,
            overview: tmdbMovie.overview,
            posterUrl: tmdbMovie.poster_path ? `${TMDB_IMG_URL}${tmdbMovie.poster_path}` : null,
            tmdbId: tmdbMovie.id,
            releaseDate: tmdbMovie.release_date
        });

        await movie.save();
        res.status(201).json(movie);

    } catch (err) {
        if (err.response) console.error('Error TMDB:', err.response.data);
        res.status(500).json({ message: 'Error al importar la película.', error: err.message });
    }
};

// Importar una SERIE DE TV
exports.importTVShow = async (req, res) => {
    const { name } = req.body; // El título de la serie
    if (!name) {
        return res.status(400).json({ message: 'Se requiere un nombre' });
    }

    try {
        // 1. Buscar la serie en TMDB
        const searchResponse = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
            params: { api_key: TMDB_API_KEY, query: name, language: 'es-ES' }
        });

        if (searchResponse.data.results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron series con ese nombre.' });
        }

        // 2. Tomar el primer resultado
        const tmdbShow = searchResponse.data.results[0];

        // 3. Verificar si ya existe
        let show = await TVShow.findOne({ tmdbId: tmdbShow.id });
        if (show) {
            return res.status(400).json({ message: 'Esa serie ya fue importada.' });
        }

        // 4. Crear y guardar
        show = new TVShow({
            name: tmdbShow.name,
            overview: tmdbShow.overview,
            posterUrl: tmdbShow.poster_path ? `${TMDB_IMG_URL}${tmdbShow.poster_path}` : null,
            tmdbId: tmdbShow.id,
            firstAirDate: tmdbShow.first_air_date
        });

        await show.save();
        res.status(201).json(show);

    } catch (err) {
        res.status(500).json({ message: 'Error al importar la serie.', error: err.message });
    }
};