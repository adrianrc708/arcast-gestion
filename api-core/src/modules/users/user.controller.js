const User = require('./user.model');
const catalogApi = require('../catalog/catalog.api');
const axios = require('axios');

/**
 * ✅ FUNCIONALIDAD NETFLIX 1: Recomendaciones por IA
 * Conecta api-core con ai-engine (Sistema Distribuido)
 */
exports.getRecommendations = async (req, res) => {
    try {
        // Llamada al servicio de Python con TIMEOUT (Resiliencia ISO 25010)
        // Asumiendo que tu ai-engine corre en el puerto 5000
        const aiResponse = await axios.post(`${process.env.AI_ENGINE_URL || 'http://localhost:5000'}/recommend`, {
            userId: req.user.id
        }, { timeout: 3000 });

        const recommendedIds = aiResponse.data.recommendations; // [tmdbId1, tmdbId2...]
        const movies = await catalogApi.getRecommendedContent(recommendedIds);

        res.json(movies);
    } catch (err) {
        // Fallback: Si la IA falla, devolvemos algo genérico para no romper la web
        console.error("AI Engine offline o lento, enviando fallback");
        const defaultContent = await catalogApi.getRecommendedContent([]);
        res.json(defaultContent);
    }
};

/**
 * ✅ FUNCIONALIDAD NETFLIX 2: Guardar Progreso
 */
exports.updateProgress = async (req, res) => {
    const { contentId, contentType, percentWatched } = req.body;
    try {
        const user = await User.findById(req.user.id);

        // Buscamos si ya existe el progreso para este contenido
        const historyIndex = user.watchHistory.findIndex(h => h.contentId === contentId);

        if (historyIndex > -1) {
            user.watchHistory[historyIndex].percentWatched = percentWatched;
            user.watchHistory[historyIndex].lastTimeWatched = Date.now();
        } else {
            user.watchHistory.push({ contentId, contentType, percentWatched });
        }

        await user.save();
        res.json({ message: "Progreso guardado" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ... (Mantén aquí tus funciones de getMe, getWatchlist, etc. de tus commits anteriores)
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