/** @type {any} */
const Movie = require('./movie.model');

/** @type {any} */
const audit = require('../../common/audit.service');

const { catchAsync, AppError } = require('../../common/error.utils');

/** @type {any} */
const tmdbProvider = require('./providers/tmdb.provider');

/**
 * VISTA ADMIN: Importación agnóstica al proveedor
 */
exports.importMovie = catchAsync(async (req, res, next) => {
    const { externalId, provider = 'tmdb' } = req.body;

    if (!externalId) return next(new AppError('Se requiere un ID externo.', 400));

    let movieData;

    if (provider === 'tmdb') {
        // noinspection JSUnresolvedFunction
        movieData = await tmdbProvider.getMovieDetails(externalId);
    } else {
        return next(new AppError(`El proveedor '${provider}' no está implementado.`, 400));
    }

    // noinspection JSUnresolvedFunction
    let movieExists = await Movie.findOne({ tmdbId: movieData.tmdbId });

    if (movieExists) {
        return next(new AppError('Este contenido ya existe en el catálogo.', 400));
    }

    const movie = new Movie(movieData);
    await movie.save();

    await audit.recordMutation(req.user.id, 'CATALOG_IMPORT', {
        title: movie.title,
        source: provider
    }, req.ip);

    res.status(201).json({ status: 'success', data: movie });
});

/**
 * Nota: Implementar importTVShow siguiendo el mismo patrón de Movie.
 */
exports.importTVShow = catchAsync(async (req, res, _next) => {
    res.status(501).json({ message: "Importación de TV no implementada aún" });
});