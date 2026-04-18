const moviesService = require('./movies.service');

exports.createMovie = async (req, res, next) => {
    try {
        const savedMovie = await moviesService.create({ title: req.body.title });
        res.status(201).json(savedMovie);
    } catch (err) {
        next(err);
    }
};

exports.getAllMovies = async (req, res, next) => {
    try {
        const { genre, platform, sort, search } = req.query;
        let query = {};

        if (search) query.title = { $regex: search, $options: 'i' };
        if (genre && genre !== 'Todas') query.genres = genre;
        if (platform && platform !== 'Todas') query['platforms.name'] = { $regex: platform, $options: 'i' };

        const movies = await moviesService.findAll(query, sort, search);
        res.json(movies);
    } catch (err) {
        next(err);
    }
};

exports.getMovieById = async (req, res, next) => {
    try {
        const movie = await moviesService.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Película no encontrada' });
        res.json(movie);
    } catch (err) {
        next(err);
    }
};