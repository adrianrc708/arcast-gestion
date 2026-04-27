/** * ✅ SOLUCIÓN RADICAL PARA WEBSTORM:
 * Realizamos el casteo directamente en la línea del require.
 * Esto elimina "Method expression is not of Function type" en el constructor 'new Movie'.
 * @type {any}
 */
const Movie = (/** @type {any} */ (require('./movie.model')));

/** @type {any} */
const audit = (/** @type {any} */ (require('../../common/audit.service')));

const { catchAsync, AppError } = require('../../common/error.utils');

/** * ✅ SOLUCIÓN PARA PROVIDERS:
 * @type {{getMovieDetails: function(string): Promise<any>}}
 */
const tmdbProvider = (/** @type {any} */ (require('./providers/tmdb.provider')));

/**
 * VISTA ADMIN: Importación agnóstica al proveedor (ISO 25010: Extensibilidad)
 */
exports.importMovie = catchAsync(async (req, res, next) => {
    const { externalId, provider = 'tmdb' } = req.body;

    if (!externalId) return next(new AppError('Se requiere un ID externo para importar.', 400));

    let movieData;

    // Selección de proveedor
    if (provider === 'tmdb') {
        movieData = await tmdbProvider.getMovieDetails(externalId);
    } else {
        return next(new AppError(`El proveedor '${provider}' no está implementado.`, 400));
    }

    // Validación de duplicados local
    // noinspection JSUnresolvedFunction
    let movie = await Movie.findOne({ tmdbId: movieData.tmdbId });

    if (movie) {
        return next(new AppError('Este contenido ya existe en el catálogo de Arcast.', 400));
    }

    // ✅ Al haber casteado Movie arriba, el 'new' ya no dará advertencias.
    movie = new Movie(movieData);
    await movie.save();

    // Auditoría de la acción (Trazabilidad)
    await audit.recordMutation(req.user.id, 'CATALOG_IMPORT', {
        title: movie.title,
        source: provider
    }, req.ip);

    res.status(201).json({ status: 'success', data: movie });
});