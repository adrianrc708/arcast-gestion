const User = require('./user.model');
const Movie = require('../catalog/movie.model');
const Review = require('../reviews/review.model');
const axios = require('axios');
const audit = require('../../common/audit.service');

// VISTA JEFE: Estadísticas globales (Capa de Negocio)
exports.getBossStats = async (req, res) => {
    try {
        const [totalUsers, totalMovies, totalReviews] = await Promise.all([
            User.countDocuments(),
            Movie.countDocuments(),
            Review.countDocuments()
        ]);
        const topRated = await Movie.find().sort({ voteAverage: -1 }).limit(5);
        res.json({ stats: { totalUsers, totalMovies, totalReviews }, topContent: topRated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// IA REAL: Conexión con motor Python distribuido
exports.getRecommendations = async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5000/recommend', {
            userId: req.user.id,
            preferredGenres: ["Acción", "Drama"]
        }, { timeout: 3000 });
        const catalogApi = require('../catalog/catalog.api');
        const content = await catalogApi.getRecommendedContent(response.data.recommendations);
        res.json(content);
    } catch (err) {
        const catalogApi = require('../catalog/catalog.api');
        const fallback = await catalogApi.getRecommendedContent([]);
        res.json(fallback);
    }
};

// --- RESTO DE FUNCIONES DE USUARIO ---
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
        res.json({ message: "Progreso guardado" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};