const User = require('./user.model');
const Movie = require('../catalog/movie.model');
const Review = require('../reviews/review.model');
const axios = require('axios');

/**
 * VISTA JEFE: Estadísticas globales de la plataforma
 */
exports.getBossStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMovies = await Movie.countDocuments();
        const totalReviews = await Review.countDocuments();

        // Películas con mejor calificación promedio
        const topRated = await Movie.find().sort({ voteAverage: -1 }).limit(5);

        res.json({
            summary: { users: totalUsers, content: totalMovies, reviews: totalReviews },
            topContent: topRated
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

/**
 * IA REAL: Conexión distribuida con Python
 */
exports.getRecommendations = async (req, res) => {
    try {
        const aiResponse = await axios.post('http://localhost:5000/recommend', {
            userId: req.user.id,
            preferredGenres: ["Acción", "Sci-Fi"]
        }, { timeout: 3000 });

        const catalogApi = require('../catalog/catalog.api');
        const content = await catalogApi.getRecommendedContent(aiResponse.data.recommendations);
        res.json(content);
    } catch (err) {
        const catalogApi = require('../catalog/catalog.api');
        const fallback = await catalogApi.getRecommendedContent([]);
        res.json(fallback);
    }
};

// --- MANTENEMOS CRUD DE USUARIO (YA CERRADO) ---
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProgress = async (req, res) => {
    const { contentId, percentWatched } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const idx = user.watchHistory.findIndex(h => h.contentId === contentId);
        if (idx > -1) user.watchHistory[idx].percentWatched = percentWatched;
        else user.watchHistory.push({ contentId, percentWatched });
        await user.save();
        res.json({ message: "OK" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};