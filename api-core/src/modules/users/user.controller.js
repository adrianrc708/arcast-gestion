/**
 * @type {any}
 */
const User = require('./user.model');
/** @type {any} */
const Movie = require('../catalog/movie.model');
/** @type {any} */
const Review = require('../reviews/review.model');
const axios = require('axios');
const audit = require('../../common/audit.service');
const catalogApi = require('../catalog/catalog.api');

/**
 * @typedef {Object} UserDoc
 * @property {string} _id
 * @property {string} username
 * @property {function(): Promise<UserDoc>} save
 * @property {Array<{contentId: string, percentWatched: number}>} watchHistory
 * @property {Array<{item: string, kind: string, _id: string}>} watchlist
 */

exports.getBossStats = async (req, res) => {
    try {
        // noinspection JSUnresolvedFunction
        const [totalUsers, totalMovies, totalReviews] = await Promise.all([
            User.countDocuments(),
            Movie.countDocuments(),
            Review.countDocuments()
        ]);

        // noinspection JSUnresolvedFunction
        const topRated = await Movie.find().sort({ voteAverage: -1 }).limit(5);

        res.json({
            metrics: { totalUsers, totalMovies, totalReviews },
            rankings: topRated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRecommendations = async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5000/recommend', {
            userId: req.user.id,
            preferredGenres: ["Sci-Fi", "Acción"]
        }, { timeout: 3000 });

        // noinspection JSUnresolvedVariable
        const recommendations = response.data.recommendations;
        const content = await catalogApi.getRecommendedContent(recommendations);
        res.json(content);
    } catch (err) {
        console.error("Fallo de infraestructura IA, usando fallback.");
        const fallback = await catalogApi.getRecommendedContent([]);
        res.json(fallback);
    }
};

exports.getMe = async (req, res) => {
    try {
        // noinspection JSUnresolvedFunction
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateMe = async (req, res) => {
    const { username } = req.body;
    try {
        // noinspection JSUnresolvedFunction
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        /** @type {UserDoc} */
        const userDoc = user;
        const oldName = userDoc.username;

        if (username && username !== userDoc.username) {
            // noinspection JSUnresolvedFunction
            const exists = await User.findOne({ username });
            if (exists) return res.status(400).json({ message: 'Usuario ya existe.' });
            userDoc.username = username;
        }

        await userDoc.save();

        await audit.recordMutation(req.user.id, 'USER_PROFILE_MUTATION', { from: oldName, to: userDoc.username }, req.ip);

        res.json(userDoc);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProgress = async (req, res) => {
    const { contentId, percentWatched } = req.body;
    try {
        // noinspection JSUnresolvedFunction
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        /** @type {UserDoc} */
        const userDoc = user;

        const idx = userDoc.watchHistory.findIndex(h => h.contentId === contentId);
        if (idx > -1) userDoc.watchHistory[idx].percentWatched = percentWatched;
        else userDoc.watchHistory.push({ contentId, percentWatched });

        await userDoc.save();
        res.json({ message: "OK" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        /** @type {UserDoc} */
        const userDoc = user;

        const movieIds = userDoc.watchlist.filter(i => i.kind === 'Movie').map(i => i.item);
        const tvIds = userDoc.watchlist.filter(i => i.kind === 'TVShow').map(i => i.item);

        const { movies, tvshows } = await catalogApi.getBulkItems(movieIds, tvIds);

        const finalWatchlist = userDoc.watchlist.map(entry => {
            const data = entry.kind === 'Movie'
                ? movies.find(m => m._id.toString() === entry.item.toString())
                : tvshows.find(t => t._id.toString() === entry.item.toString());
            return data ? { _id: entry._id, kind: entry.kind, item: data } : null;
        }).filter(item => item !== null);

        res.json({ watchlist: finalWatchlist });
    } catch (err) { res.status(500).json({ message: err.message }); }
};