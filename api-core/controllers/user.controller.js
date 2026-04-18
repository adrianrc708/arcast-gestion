const User = require('../models/user.model');
const Review = require('../models/review.model');
const Movie = require('../models/movie.model');
const TVShow = require('../models/tvshow.model');

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateMe = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        // Validación: Si cambió el nombre, verificar que no exista otro igual
        if (username && username !== user.username) {
            const exists = await User.findOne({ username });
            if (exists) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
            }
            user.username = username;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        // Captura error de índice duplicado por seguridad extra
        if (err.code === 11000) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }
        res.status(500).json({ message: err.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ... (El resto del archivo se mantiene igual para addToWatchlist, getWatchlist, etc.) ...
// --- WATCHLIST: Agregar ---
exports.addToWatchlist = async (req, res) => {
    const { movieId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const exists = user.watchlist.find(w => w.item && w.item.toString() === movieId);
        if (exists) return res.status(400).json({ message: 'Ya está en tu watchlist.' });

        const isMovie = await Movie.exists({ _id: movieId });
        const isTVShow = await TVShow.exists({ _id: movieId });

        let validKind = null;
        if (isMovie) validKind = 'Movie';
        else if (isTVShow) validKind = 'TVShow';
        else return res.status(404).json({ message: 'Contenido no encontrado.' });

        user.watchlist.push({ item: movieId, kind: validKind });
        await user.save();

        res.json(user.watchlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const finalWatchlist = [];
        for (const entry of user.watchlist) {
            const itemId = entry.item;
            let foundData = await Movie.findById(itemId);
            let realKind = 'Movie';

            if (!foundData) {
                foundData = await TVShow.findById(itemId);
                realKind = 'TVShow';
            }

            if (foundData) {
                finalWatchlist.push({
                    _id: entry._id,
                    kind: realKind,
                    item: foundData
                });
            }
        }
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

        user.watchlist = user.watchlist.filter(w => {
            if (!w.item) return false;
            const currentId = w.item._id ? w.item._id.toString() : w.item.toString();
            return currentId !== itemId;
        });

        await user.save();
        res.json({ message: 'Eliminado de la watchlist' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};