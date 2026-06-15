const { catchAsync, AppError } = require('../../common/error.utils');
const { streamVideo }          = require('./streaming.service');
const Movie   = require('../catalog/movie.model');
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

    if (!movie)        throw new AppError('Película no encontrada', 404);
    if (!movie.localPath) throw new AppError('Esta película no tiene archivo local disponible', 404);

    streamVideo(movie.localPath, req, res);
});

/**
 * GET /api/stream/episode/:tvshowId/:season/:episode
 * Sirve el episodio indicado de la serie.
 */
exports.streamEpisode = catchAsync(async (req, res, _next) => {
    const { tvshowId, season, episode } = req.params;

    const ep = await Episode.findOne({
        tvshowId,
        season:  Number(season),
        episode: Number(episode),
    }).select('localPath title');

    if (!ep)           throw new AppError('Episodio no encontrado', 404);
    if (!ep.localPath) throw new AppError('Este episodio no tiene archivo local disponible', 404);

    streamVideo(ep.localPath, req, res);
});
