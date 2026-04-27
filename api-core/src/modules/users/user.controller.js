const User = require('./user.model');
const Movie = require('../catalog/movie.model');
const Review = require('../reviews/review.model');
const axios = require('axios');
const audit = require('../../common/audit.service');
const catalogApi = require('../catalog/catalog.api');

// VISTA JEFE: Analítica Institucional
exports.getBossStats = async (req, res) => {
    try {
        const [totalUsers, totalMovies, totalReviews] = await Promise.all([
            User.countDocuments(),
            Movie.countDocuments(),
            Review.countDocuments()
        ]);

        // Contenido con mejor rating (Valor de negocio)
        const topRated = await Movie.find().sort({ voteAverage: -1 }).limit(5);

        res.json({
            metrics: { totalUsers, totalMovies, totalReviews },
            rankings: topRated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// IA REAL: Comunicación distribuida con Python
exports.getRecommendations = async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5000/recommend', {
            userId: req.user.id,
            preferredGenres: ["Sci-Fi", "Acción"]
        }, { timeout: 3000 });

        const content = await catalogApi.getRecommendedContent(response.data.recommendations);
        res.json(content);
    } catch (err) {
        console.error("Fallo de infraestructura IA, usando fallback.");
        const fallback = await catalogApi.getRecommendedContent([]);
        res.json(fallback);
    }
};

// PERFIL: Información del usuario
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// AUDITORÍA: Cambio de datos sensibles (Mutación Importante)
exports.updateMe = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const oldName = user.username;
        if (username && username !== user.username) {
            const exists = await User.findOne({ username });
            if (exists) return res.status(400).json({ message: 'Usuario ya existe.' });
            user.username = username;
        }
        await user.save();
        await audit.recordMutation(req.user.id, 'USER_PROFILE_MUTATION', { from: oldName, to: user.username }, req.ip);
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// PROGRESO: Seguir viendo
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

// WATCHLIST: Gestión de lista de deseos
exports.getWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const movieIds = user.watchlist.filter(i => i.kind === 'Movie').map(i => i.item);
        const tvIds = user.watchlist.filter(i => i.kind === 'TVShow').map(i => i.item);
        const { movies, tvshows } = await catalogApi.getBulkItems(movieIds, tvIds);
        const finalWatchlist = user.watchlist.map(entry => {
            const data = entry.kind === 'Movie'
                ? movies.find(m => m._id.toString() === entry.item.toString())
                : tvshows.find(t => t._id.toString() === entry.item.toString());
            return data ? { _id: entry._id, kind: entry.kind, item: data } : null;
        }).filter(item => item !== null);
        res.json({ watchlist: finalWatchlist });
    } catch (err) { res.status(500).json({ message: err.message }); }
};