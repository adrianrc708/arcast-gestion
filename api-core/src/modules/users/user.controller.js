const User = require('./user.model');
const catalogApi = require('../catalog/catalog.api');
const axios = require('axios');
const audit = require('../../common/audit.service');

/**
 * IA REAL: Solicita recomendaciones al servicio Python basadas en datos.
 */
exports.getRecommendations = async (req, res) => {
    try {
        // Obtenemos géneros del usuario para que la IA decida de verdad
        const user = await User.findById(req.user.id);

        const aiResponse = await axios.post('http://localhost:5000/recommend', {
            userId: req.user.id,
            preferredGenres: ["Acción", "Sci-Fi"] // Esto podría venir de su historial
        }, { timeout: 4000 });

        const recommendedIds = aiResponse.data.recommendations || [];
        const content = await catalogApi.getRecommendedContent(recommendedIds);
        res.json(content);
    } catch (err) {
        // Auditoría de fallo de infraestructura (Fiabilidad ISO)
        await audit.recordMutation(req.user.id, 'INFRASTRUCTURE_FAILURE', {
            service: 'ai-engine',
            error: err.message
        });
        const fallback = await catalogApi.getRecommendedContent([]);
        res.json(fallback);
    }
};

/**
 * AUDITORÍA DE MUTACIÓN: Cambios sensibles en la base de datos de usuarios.
 */
exports.updateMe = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const oldData = { username: user.username };

        if (username && username !== user.username) {
            const exists = await User.findOne({ username });
            if (exists) return res.status(400).json({ message: 'Usuario ya existe.' });
            user.username = username;
        }

        await user.save();

        // Registramos la mutación de datos sensibles para auditoría
        await audit.recordMutation(req.user.id, 'USER_PROFILE_MUTATION', {
            before: oldData,
            after: { username: user.username }
        });

        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

/**
 * PROGRESO REAL: Guarda el estado de visualización.
 */
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

// --- MANTENEMOS FUNCIONES DEL COMMIT 2109b9c ---

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

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await reviewsApi.getReviewsByUserId(req.user.id);
        res.json(reviews);
    } catch (err) { res.status(500).json({ message: err.message }); }
};