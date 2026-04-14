const moviesService = require('./movies.service');
const { catchAsync, AppError } = require('../../common/error.utils');

exports.getAllMovies = catchAsync(async (req, res, _next) => {
    const { genre, platform, sort, search } = req.query;
    let query = {};

    if (search) query.title = { $regex: search, $options: 'i' };
    if (genre && genre !== 'Todas') query.genres = genre;
    if (platform && platform !== 'Todas') query['platforms.name'] = { $regex: platform, $options: 'i' };

    const movies = await moviesService.findAll(query, String(sort || ''), String(search || ''));
    res.json(movies);
});

exports.getMovieById = catchAsync(async (req, res, _next) => {
    const movie = await moviesService.findById(req.params.id);
    if (!movie) throw new AppError('Película no encontrada', 404);
    res.json(movie);
});

exports.createMovie = catchAsync(async (req, res, _next) => {
    if (!req.body.tmdbId) {
        req.body.tmdbId = 'manual-' + Date.now();
    }
    const savedMovie = await moviesService.create(req.body);
    res.status(201).json(savedMovie);
});

exports.updateMovie = catchAsync(async (req, res, _next) => {
    const movie = await moviesService.update(req.params.id, req.body);
    if (!movie) throw new AppError('Película no encontrada', 404);
    res.json(movie);
});

exports.deleteMovie = catchAsync(async (req, res, _next) => {
    await moviesService.delete(req.params.id);
    res.json({ message: 'Película eliminada' });
});