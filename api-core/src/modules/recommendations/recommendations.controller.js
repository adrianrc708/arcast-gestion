const { catchAsync, AppError } = require('../../common/error.utils');
const User = require('../users/user.model');
const { extractPreferredGenres, getRecommendations } = require('./recommendations.service');

/**
 * POST /api/recommendations/:userId
 * Devuelve una lista de tmdbIds recomendados con justificación del motor de IA.
 */
exports.getRecommendations = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 5, 10);

    // Solo el propio usuario o un admin puede pedir sus recomendaciones
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'boss') {
        return next(new AppError('No tienes permiso para ver las recomendaciones de otro usuario', 403));
    }

    const user = await User.findById(userId).select('watchHistory watchlist');
    if (!user) return next(new AppError('Usuario no encontrado', 404));

    // IDs ya vistos para no repetir en las recomendaciones
    const watchedIds = user.watchHistory.map(h => h.contentId);

    // Géneros preferidos derivados del historial
    const preferredGenres = extractPreferredGenres(
        user.watchHistory,
        user.watchlist
    );

    const result = await getRecommendations(userId, preferredGenres, watchedIds, limit);

    res.json({
        status: 'success',
        data: {
            userId,
            preferredGenres,
            ...result,
            justification: preferredGenres.length
                ? `Recomendaciones basadas en tus géneros más vistos: ${preferredGenres.slice(0, 3).join(', ')}.`
                : 'Recomendaciones generales — agrega contenido a tu historial para personalizarlas.',
        },
    });
});
