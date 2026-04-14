/** @type {any} */
const Review = require('./review.model');
const catalogApi = require('../catalog/catalog.api');
const { catchAsync, AppError } = require('../../common/error.utils');

/**
 * @typedef {Object} ReviewDoc
 * @property {function(): Object} toObject
 * @property {function(): Promise<ReviewDoc>} save
 * @property {function(): Promise<void>} deleteOne
 * @property {string} _id
 * @property {string} movieId
 * @property {string} movieTitle
 * @property {string} username
 * @property {string} text
 * @property {number} rating
 * @property {string} userId
 * @property {string} contentType
 */

const getCatalogItem = async (id, type) => type === 'movie' ? catalogApi.getMovieById(id) : catalogApi.getTVShowById(id);

const attachCatalogDetails = async (review) => {
    const catalogItem = await getCatalogItem(review.movieId, review.contentType);
    return {
        ...review.toObject(),
        movieTitle: catalogItem ? (catalogItem.title || catalogItem.name) : 'Contenido Desconocido',
        catalogDetails: catalogItem
    };
};

/**
 * Helper para validar existencia y autoría.
 */
const validateOwnership = async (id, currentUser) => {
    // noinspection JSUnresolvedFunction
    const review = await Review.findById(id);
    if (!review) throw new AppError('Reseña no encontrada', 404);

    // Si no hay usuario logueado, bloquea inmediatamente
    if (!currentUser) {
        throw new AppError('No autorizado para modificar esta reseña.', 403);
    }

    // Verificamos si es el dueño
    const isOwner = review.userId && review.userId.toString() === currentUser.id;
    // Verificamos si tiene rango de admin o boss
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'boss';

    // Si NO es el dueño Y TAMPOCO es administrador, lanzamos error
    if (!isOwner && !isAdmin) {
        throw new AppError('No autorizado para modificar esta reseña.', 403);
    }

    return (/** @type {ReviewDoc} */ (review));
};

exports.getAllReviews = catchAsync(async (req, res, _next) => {
    // noinspection JSUnresolvedFunction
    res.json(await Promise.all(
        (/** @type {ReviewDoc[]} */ (await Review.find().sort({ date: -1 })))
            .map(attachCatalogDetails)
    ));
});

exports.getReviewsByMovie = catchAsync(async (req, res, _next) => {
    // noinspection JSUnresolvedFunction
    res.json(await Review.find({ movieId: req.params.movieId }).sort({ date: -1 }));
});

exports.createReview = catchAsync(async (req, res, next) => {
    const { movieId, text, rating, contentType } = req.body;
    const catalogItem = await getCatalogItem(movieId, contentType || 'movie');

    if (!catalogItem) return next(new AppError('El contenido no existe en el catálogo.', 404));

    const review = new Review({
        movieId, text, rating,
        username: req.user ? req.user.username : (req.body.username || 'Anónimo'),
        userId: req.user ? req.user.id : null,
        contentType: contentType || 'movie',
        movieTitle: catalogItem.title || catalogItem.name
    });

    res.status(201).json(await review.save());
});

exports.updateReview = catchAsync(async (req, res, _next) => {
    const reviewDoc = await validateOwnership(req.params.id, req.user);
    reviewDoc.text = req.body.text || reviewDoc.text;
    reviewDoc.rating = req.body.rating || reviewDoc.rating;
    res.json(await reviewDoc.save());
});

exports.deleteReview = catchAsync(async (req, res, _next) => {
    const reviewDoc = await validateOwnership(req.params.id, req.user);
    await reviewDoc.deleteOne();
    res.json({ message: 'Reseña eliminada.' });
});

exports.getAllReviews = catchAsync(async (req, res, _next) => {
    // noinspection JSUnresolvedFunction
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
});

exports.getMyReviews = catchAsync(async (req, res) => {
    const reviews = await Review.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(reviews);
});