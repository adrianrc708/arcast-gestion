const Review = require('./review.model');
// ✅ IMPORTAMOS LA API DEL CATÁLOGO
const catalogApi = require('../catalog/catalog.api');

// Helper interno para adjuntar detalles del catálogo a una reseña
const attachCatalogDetails = async (review) => {
    let catalogItem = null;
    if (review.contentType === 'movie') {
        catalogItem = await catalogApi.getMovieById(review.movieId);
    } else {
        catalogItem = await catalogApi.getTVShowById(review.movieId);
    }

    return {
        ...review.toObject(),
        // Agregamos el título de forma dinámica
        movieTitle: catalogItem ? (catalogItem.title || catalogItem.name) : 'Contenido Desconocido',
        catalogDetails: catalogItem // Opcional: podrías enviar más datos si el frontend lo necesita
    };
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ date: -1 });
        // Enriquecemos las reseñas con datos del catálogo antes de enviarlas
        const enrichedReviews = await Promise.all(reviews.map(attachCatalogDetails));
        res.json(enrichedReviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getReviewsByMovie = async (req, res) => {
    try {
        const reviews = await Review.find({ movieId: req.params.movieId }).sort({ date: -1 });
        res.json(reviews); // Aquí no necesitamos enriquecer porque ya estamos en la página de la película
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createReview = async (req, res) => {
    // ELIMINAMOS movieTitle del req.body destructuring
    const { movieId, text, rating, contentType } = req.body;

    let username;
    let userId = null;

    if (req.user) {
        username = req.user.username;
        userId = req.user.id;
    } else {
        username = req.body.username || 'Anónimo';
    }

    // ✅ VALIDAMOS QUE LA PELÍCULA EXISTE ANTES DE CREAR LA RESEÑA
    let catalogItem = null;
    if (contentType === 'movie') catalogItem = await catalogApi.getMovieById(movieId);
    else catalogItem = await catalogApi.getTVShowById(movieId);

    if (!catalogItem) {
        return res.status(404).json({ message: 'El contenido que intentas reseñar no existe en el catálogo.' });
    }

    const review = new Review({
        movieId,
        text,
        rating,
        username,
        userId,
        contentType: contentType || 'movie'
    });

    try {
        const newReview = await review.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

        if (!req.user || (review.userId && review.userId.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Acción no autorizada.' });
        }

        review.text = req.body.text || review.text;
        review.rating = req.body.rating || review.rating;

        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

        if (!req.user || (review.userId && review.userId.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Acción no autorizada.' });
        }

        await review.deleteOne();
        res.json({ message: 'Reseña eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};