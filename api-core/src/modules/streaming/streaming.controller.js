const { catchAsync, AppError } = require('../../common/error.utils');
const streamingService = require('./streaming.service');
const Movie = require('../catalog/movie.model');
const Episode = require('../catalog/episode.model');

/**
 * GET /api/stream/movie/:id
 * Sirve la película cuyo _id o tmdbId coincide con :id.
 * Requiere que el documento tenga localPath configurado.
 */
exports.streamMovie = catchAsync(async (req, res, _next) => {
    const { id } = req.params;

    let movie = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        movie = await Movie.findById(id).select('localPath title');
    }

    if (!movie) {
        movie = await Movie.findOne({ tmdbId: id }).select('localPath title');
    }

    if (!movie) throw new AppError('Película no encontrada', 404);
    if (!movie.localPath) throw new AppError('Esta película no tiene archivo local disponible', 404);

    streamingService.streamVideo(movie.localPath, req, res);
});

/**
 * GET /api/stream/episode/:tvshowId/:season/:episode
 * Sirve el episodio indicado de la serie.
 */
exports.streamEpisode = catchAsync(async (req, res, _next) => {
    const { tvshowId, season, episode } = req.params;

    const ep = await Episode.findOne({
        tvshowId,
        season: Number(season),
        episode: Number(episode),
    }).select('localPath title');

    if (!ep) throw new AppError('Episodio no encontrado', 404);
    if (!ep.localPath) throw new AppError('Este episodio no tiene archivo local disponible', 404);

    streamingService.streamVideo(ep.localPath, req, res);
});

/**
 * POST /api/streaming/progress
 * Guarda o actualiza el progreso de visualización.
 */
exports.saveProgress = catchAsync(async (req, res, next) => {
    const { contentId, currentTime, duration } = req.body;
    const userId = req.user.id; // Asumiento que el middleware de auth añade el usuario a req

    if (!contentId || currentTime === undefined || duration === undefined) {
        return next(new AppError('Faltan parámetros: contentId, currentTime y duration son requeridos', 400));
    }

    const progress = await streamingService.saveOrUpdateProgress(userId, contentId, currentTime, duration);

    res.status(200).json({
        status: 'success',
        data: {
            progress
        }
    });
});

/**
 * GET /api/streaming/progress/:contentId
 * Recupera el progreso de un contenido específico.
 */
exports.getProgress = catchAsync(async (req, res, next) => {
    const { contentId } = req.params;
    const userId = req.user.id;

    const progress = await streamingService.getProgress(userId, contentId);

    if (!progress) {
        return next(new AppError('No se encontró progreso para este contenido', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            progress
        }
    });
});

/**
 * GET /api/streaming/continue-watching
 * Recupera la lista de "Continuar viendo".
 */
exports.getContinueWatching = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const list = await streamingService.getContinueWatchingList(userId);

    res.status(200).json({
        status: 'success',
        results: list.length,
        data: {
            list
        }
    });
});