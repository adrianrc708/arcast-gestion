const User = require('./user.model');
const catalogApi = require('../catalog/catalog.api');
const reviewsApi = require('../reviews/reviews.api');

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        // ✅ OPTIMIZACIÓN: Clasificamos IDs para pedir todo en una sola llamada
        const movieIds = user.watchlist.filter(i => i.kind === 'Movie').map(i => i.item);
        const tvIds = user.watchlist.filter(i => i.kind === 'TVShow').map(i => i.item);

        const { movies, tvshows } = await catalogApi.getBulkItems(movieIds, tvIds);

        // Mapeamos los resultados para devolver el formato esperado
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

exports.removeFromWatchlist = async (req, res) => {
    const { itemId } = req.params;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        // ✅ CORRECCIÓN DE BUG: Comparación directa de strings para ObjectId
        user.watchlist = user.watchlist.filter(w =>
            w.item && w.item.toString() !== itemId
        );

        await user.save();
        res.json({ message: 'Eliminado de la watchlist' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Mantén tus otras funciones (updateMe, getMyReviews, addToWatchlist) como estaban
exports.updateMe = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
        if (username && username !== user.username) {
            const exists = await User.findOne({ username });
            if (exists) return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
            user.username = username;
        }
        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await reviewsApi.getReviewsByUserId(req.user.id);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addToWatchlist = async (req, res) => {
    const { movieId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
        const exists = user.watchlist.find(w => w.item && w.item.toString() === movieId);
        if (exists) return res.status(400).json({ message: 'Ya está en tu watchlist.' });

        const movie = await catalogApi.getMovieById(movieId);
        const tvshow = await catalogApi.getTVShowById(movieId);
        let validKind = movie ? 'Movie' : (tvshow ? 'TVShow' : null);

        if (!validKind) return res.status(404).json({ message: 'Contenido no encontrado.' });

        user.watchlist.push({ item: movieId, kind: validKind });
        await user.save();
        res.json(user.watchlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};