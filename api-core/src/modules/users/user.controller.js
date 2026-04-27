const User = require('./user.model');
const catalogApi = require('../catalog/catalog.api');
const reviewsApi = require('../reviews/reviews.api');
const axios = require('axios');

exports.getRecommendations = async (req, res) => {
    try {
        // ✅ CALIDAD: Timeout de 3s para que Node no se cuelgue si la IA falla (Resiliencia)
        const aiResponse = await axios.post(`${process.env.AI_ENGINE_URL || 'http://localhost:5000'}/recommend`, {
            userId: req.user.id
        }, { timeout: 3000 });

        const recommendedIds = aiResponse.data.recommendations || [];
        const movies = await catalogApi.getRecommendedContent(recommendedIds);
        res.json(movies);
    } catch (err) {
        console.error("AI Engine lento o caído. Enviando recomendaciones por defecto.");
        const fallback = await catalogApi.getRecommendedContent([]);
        res.json(fallback);
    }
};

exports.getWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const movieIds = user.watchlist.filter(i => i.kind === 'Movie').map(i => i.item);
        const tvIds = user.watchlist.filter(i => i.kind === 'TVShow').map(i => i.item);

        // ✅ RENDIMIENTO: Una sola consulta para todo el catálogo (Adiós al problema N+1)
        const { movies, tvshows } = await catalogApi.getBulkItems(movieIds, tvIds);

        const finalWatchlist = user.watchlist.map(entry => {
            const data = entry.kind === 'Movie'
                ? movies.find(m => m._id.toString() === entry.item.toString())
                : tvshows.find(t => t._id.toString() === entry.item.toString());
            return data ? { _id: entry._id, kind: entry.kind, item: data } : null;
        }).filter(item => item !== null);

        res.json({ watchlist: finalWatchlist });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProgress = async (req, res) => {
    const { contentId, contentType, percentWatched } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const historyIndex = user.watchHistory.findIndex(h => h.contentId === contentId);

        if (historyIndex > -1) {
            user.watchHistory[historyIndex].percentWatched = percentWatched;
            user.watchHistory[historyIndex].lastTimeWatched = Date.now();
        } else {
            user.watchHistory.push({ contentId, contentType, percentWatched });
        }
        await user.save();
        res.json({ message: "Progreso guardado" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addToWatchlist = async (req, res) => {
    const { movieId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const exists = user.watchlist.find(w => w.item && w.item.toString() === movieId);
        if (exists) return res.status(400).json({ message: 'Ya está en tu watchlist.' });

        const movie = await catalogApi.getMovieById(movieId);
        const tvshow = await catalogApi.getTVShowById(movieId);
        let kind = movie ? 'Movie' : (tvshow ? 'TVShow' : null);

        if (!kind) return res.status(404).json({ message: 'Contenido no encontrado.' });

        user.watchlist.push({ item: movieId, kind });
        await user.save();
        res.json(user.watchlist);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.removeFromWatchlist = async (req, res) => {
    const { itemId } = req.params;
    try {
        const user = await User.findById(req.user.id);
        user.watchlist = user.watchlist.filter(w => w.item && w.item.toString() !== itemId);
        await user.save();
        res.json({ message: 'Eliminado' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await reviewsApi.getReviewsByUserId(req.user.id);
        res.json(reviews);
    } catch (err) { res.status(500).json({ message: err.message }); }
};