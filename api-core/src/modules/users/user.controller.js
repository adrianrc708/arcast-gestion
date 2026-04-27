const User = require('./user.model');
const catalogApi = require('../catalog/catalog.api');
const reviewsApi = require('../reviews/reviews.api');
const axios = require('axios');
const audit = require('../../common/audit.service'); // ✅ Auditoría

exports.getRecommendations = async (req, res) => {
    try {
        // Llamada real al sistema distribuido (IA en Python)
        const aiResponse = await axios.post('http://localhost:5000/recommend', {
            userId: req.user.id,
            preferredGenres: ["Acción", "Drama"]
        }, { timeout: 3000 }); // Resiliencia: tiempo límite

        const recommendedIds = aiResponse.data.recommendations || [];
        const content = await catalogApi.getRecommendedContent(recommendedIds);
        res.json(content);
    } catch (err) {
        // Si la IA falla, auditamos el error de infraestructura y enviamos plan B
        await audit.recordMutation('system', 'IA_SERVICE_FAILURE', { error: err.message });
        const fallback = await catalogApi.getRecommendedContent([]);
        res.json(fallback);
    }
};

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

        // AUDITORÍA: Cambio en datos de cuenta (Mutación)
        await audit.recordMutation(req.user.id, 'USER_PROFILE_UPDATE', {
            from: oldName,
            to: user.username
        }, req.ip);

        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- RESTO DE FUNCIONES (BACKEND CERRADO) ---

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

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

exports.addToWatchlist = async (req, res) => {
    const { movieId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const exists = user.watchlist.find(w => w.item && w.item.toString() === movieId);
        if (exists) return res.status(400).json({ message: 'Ya está en la lista' });
        const movie = await catalogApi.getMovieById(movieId);
        const tvshow = await catalogApi.getTVShowById(movieId);
        let kind = movie ? 'Movie' : (tvshow ? 'TVShow' : null);
        if (!kind) return res.status(404).json({ message: 'No encontrado' });
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

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await reviewsApi.getReviewsByUserId(req.user.id);
        res.json(reviews);
    } catch (err) { res.status(500).json({ message: err.message }); }
};