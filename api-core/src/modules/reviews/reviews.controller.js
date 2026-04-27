/** @type {any} */
const Review = require('./review.model');
const catalogApi = require('../catalog/catalog.api');

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
 * @property {Date} date
 */

/**
 * Helper para obtener un ítem del catálogo según su tipo.
 */
const getCatalogItem = async (id, type) => {
    return type === 'movie'
        ? catalogApi.getMovieById(id)
        : catalogApi.getTVShowById(id);
};

/**
 * Helper interno para adjuntar detalles del catálogo a una reseña.
 */
const attachCatalogDetails = async (review) => {
    const catalogItem = await getCatalogItem(review.movieId, review.contentType);

    return {
        ...review.toObject(),
        movieTitle: catalogItem ? (catalogItem.title || catalogItem.name) : 'Contenido Desconocido',
        catalogDetails: catalogItem
    };
};

/**
 * Helper para validar existencia y propiedad de una reseña.
 */
const getReviewWithOwnership = async (id, currentUser) => {
    // noinspection JSUnresolvedFunction
    const review = await Review.findById(id);
    if (!review) return { error: 'Reseña no encontrada', status: 404 };

    /** @type {ReviewDoc} */
    const reviewDoc = review;
    if (!currentUser || (reviewDoc.userId && reviewDoc.userId.toString() !== currentUser.id)) {
        return { error: 'Acción no autorizada.', status: 403 };
    }
    return { review: reviewDoc };
};

/**
 * Obtiene todas las reseñas con sus detalles de catálogo.
 */
exports.getAllReviews = async (req, res) => {
    try {
        // noinspection JSUnresolvedFunction
        res.json(await Promise.all(
            (/** @type {ReviewDoc[]} */ (await Review.find().sort({ date: -1 })))
                .map(attachCatalogDetails)
        ));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Obtiene las reseñas de un contenido específico.
 */
exports.getReviewsByMovie = async (req, res) => {
    try {
        // noinspection JSUnresolvedFunction
        const reviews = await Review.find({ movieId: req.params.movieId }).sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Crea una nueva reseña validando la existencia del contenido.
 */
exports.createReview = async (req, res) => {
    const { movieId, text, rating, contentType } = req.body;
    const username = req.user ? req.user.username : (req.body.username || 'Anónimo');
    const userId = req.user ? req.user.id : null;

    try {
        const catalogItem = await getCatalogItem(movieId, contentType || 'movie');
        if (!catalogItem) {
            return res.status(404).json({ message: 'El contenido no existe en el catálogo.' });
        }

        const review = new Review({
            movieId, text, rating, username, userId,
            contentType: contentType || 'movie'
        });

        res.status(201).json(await review.save());
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * Actualiza una reseña propia.
 */
exports.updateReview = async (req, res) => {
    try {
        const { review, error, status } = await getReviewWithOwnership(req.params.id, req.user);
        if (error) return res.status(status).json({ message: error });

        review.text = req.body.text || review.text;
        review.rating = req.body.rating || review.rating;

        res.json(await review.save());
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * Elimina una reseña propia.
 */
exports.deleteReview = async (req, res) => {
    try {
        const { review, error, status } = await getReviewWithOwnership(req.params.id, req.user);
        if (error) return res.status(status).json({ message: error });

        await review.deleteOne();
        res.json({ message: 'Reseña eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};