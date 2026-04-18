const Review = require('../models/review.model');

// GET /api/reviews -> listar todas 
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/reviews/:movieId -> listar por película 
exports.getReviewsByMovie = async (req, res) => {
    try {
        const reviews = await Review.find({ movieId: req.params.movieId }).sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/reviews -> crear reseña (¡MODIFICADO!)
// POST /api/reviews -> crear reseña
exports.createReview = async (req, res) => {

    // Datos del formulario (Agregamos contentType)
    const { movieId, movieTitle, text, rating, contentType } = req.body;

    let username;
    let userId = null;

    if (req.user) {
        username = req.user.username;
        userId = req.user.id;
    } else {
        username = req.body.username || 'Anónimo';
    }

    const review = new Review({
        movieId,
        movieTitle,
        text,
        rating,
        username,
        userId,
        contentType: contentType || 'movie' // Guardamos el tipo
    });

    try {
        const newReview = await review.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// ... (resto del archivo igual: getAllReviews, updateReview, etc.) ...

// PUT /api/reviews/:id -> editar reseña (Modificado para seguridad)
exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

        // --- Verificación de Permiso ---
        // Solo el usuario que creó la reseña puede editarla
        // (Asumimos que las reseñas anónimas no se pueden editar por ahora)
        if (!req.user || (review.userId && review.userId.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Acción no autorizada.' });
        }
        // --- Fin Verificación ---

        review.text = req.body.text || review.text;
        review.rating = req.body.rating || review.rating;

        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE /api/reviews/:id -> eliminar reseña (Modificado para seguridad)
// DELETE /api/reviews/:id -> eliminar reseña
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

        // --- Verificación de Permiso ---
        if (!req.user || (review.userId && review.userId.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Acción no autorizada.' });
        }
        // --- Fin Verificación ---

        // CORRECCIÓN: Usar deleteOne() en lugar de remove()
        await review.deleteOne();

        res.json({ message: 'Reseña eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};