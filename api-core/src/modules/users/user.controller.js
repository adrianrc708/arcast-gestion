const User = require('../../common/models/user.model');
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
        if (err.code === 11000) return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
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

        let validKind = null;
        if (movie) validKind = 'Movie';
        else if (tvshow) validKind = 'TVShow';
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
            let foundData = null;

            if (entry.kind === 'Movie') {
                foundData = await catalogApi.getMovieById(itemId);
            } else if (entry.kind === 'TVShow') {
                foundData = await catalogApi.getTVShowById(itemId);
            }

            if (foundData) {
                finalWatchlist.push({
                    _id: entry._id,
                    kind: entry.kind,
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