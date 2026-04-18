const Movie = require('../models/movie.model');

// POST /api/movies (manual)
exports.createMovie = async (req, res) => {
    try {
        const newMovie = new Movie({ title: req.body.title });
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET /api/movies -> listar con filtros, búsqueda y aleatoriedad
exports.getAllMovies = async (req, res) => {
    try {
        const { genre, platform, sort, search } = req.query;
        let query = {};

        // Filtro Buscador (por título)
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Filtro Género
        if (genre && genre !== 'Todas') {
            query.genres = genre;
        }

        // Filtro Plataforma (Busca dentro del array de objetos platforms)
        if (platform && platform !== 'Todas') {
            query['platforms.name'] = { $regex: platform, $options: 'i' };
        }

        let movies;

        // Si NO hay criterios de ordenamiento explícitos, devolvemos aleatorio para el Home
        if (!sort && !search) {
            movies = await Movie.find(query);
            // Mezcla aleatoria en Javascript
            movies = movies.sort(() => Math.random() - 0.5);
        } else {
            let sortOption = { _id: -1 }; // Default recientes
            if (sort === 'rating') sortOption = { voteAverage: -1 };
            if (sort === 'newest') sortOption = { releaseDate: -1 };

            movies = await Movie.find(query).sort(sortOption);
        }

        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Película no encontrada' });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};