/** @type {any} */
const User = require('./user.model');
/** @type {any} */
const Movie = require('../catalog/movie.model');
/** @type {any} */
const Review = require('../reviews/review.model');
const axios = require('axios');
const audit = require('../../common/audit.service');
const catalogApi = require('../catalog/catalog.api');
const { catchAsync, AppError } = require('../../common/error.utils');

/**
 * @typedef {Object} UserDoc
 * @property {string} _id
 * @property {string} username
 * @property {function(): Promise<UserDoc>} save
 * @property {Array<{contentId: string, percentWatched: number}>} watchHistory
 * @property {Array<{item: string, kind: string, _id: string}>} watchlist
 */

exports.getBossStats = catchAsync(async (req, res, _next) => {
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
});

exports.getRecommendations = catchAsync(async (req, res, _next) => {
    try {
        const response = await axios.post('http://localhost:5000/recommend', {
            userId: req.user.id,
            preferredGenres: ["Sci-Fi", "Acción"]
        }, { timeout: 3000 });

        // noinspection JSUnresolvedVariable
        const recommendations = response.data.recommendations;

        res.json(await catalogApi.getRecommendedContent(recommendations));
    } catch (err) {
        // Fallback silencioso si la IA no responde
        res.json(await catalogApi.getRecommendedContent([]));
    }
});

exports.getMe = catchAsync(async (req, res, _next) => {
    // noinspection JSUnresolvedFunction
    const user = await User.findById(req.user.id).select('-password');
    if (!user) throw new AppError('Usuario no encontrado', 404);
    res.json(user);
});

exports.updateMe = catchAsync(async (req, res, _next) => {
    const { username } = req.body;
    // noinspection JSUnresolvedFunction
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const oldName = user.username;
    if (username && username !== user.username) {
        // noinspection JSUnresolvedFunction
        if (await User.findOne({ username })) throw new AppError('Usuario ya existe.', 400);
        user.username = username;
    }

    await user.save();
    await audit.recordMutation(req.user.id, 'USER_PROFILE_MUTATION', { from: oldName, to: user.username }, req.ip);
    res.json(user);
});

exports.updateProgress = catchAsync(async (req, res, _next) => {
    const { contentId, percentWatched } = req.body;
    // noinspection JSUnresolvedFunction
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    /** @type {UserDoc} */
    const userDoc = user;
    const idx = userDoc.watchHistory.findIndex(h => h.contentId === contentId);
    if (idx > -1) userDoc.watchHistory[idx].percentWatched = percentWatched;
    else userDoc.watchHistory.push({ contentId, percentWatched });

    await userDoc.save();
    res.json({ message: "Progreso guardado." });
});

exports.getWatchlist = catchAsync(async (req, res, _next) => {
    // noinspection JSUnresolvedFunction
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

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
});

exports.getAllUsers = catchAsync(async (req, res, _next) => {
    // noinspection JSUnresolvedFunction
    const users = await User.find().select('-password');
    res.json(users);
});

exports.updateUserRole = catchAsync(async (req, res, _next) => {
    const { role } = req.body;

    if (!['user', 'admin', 'boss'].includes(role)) {
        throw new AppError('Rol no válido', 400);
    }

    // noinspection JSUnresolvedFunction
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await audit.recordMutation(req.user.id, 'USER_ROLE_MUTATION', { targetUser: user.username, from: oldRole, to: role }, req.ip);

    res.json({ message: 'Rol actualizado exitosamente', user });
});

exports.toggleWatchlist = catchAsync(async (req, res) => {
    const { itemId, itemType } = req.body;
    const user = await User.findById(req.user.id);
    const kind = itemType === 'movie' ? 'Movie' : 'TVShow';

    const index = user.watchlist.findIndex(w => w.item.toString() === itemId);
    if (index > -1) {
        user.watchlist.splice(index, 1);
    } else {
        user.watchlist.push({ item: itemId, kind });
    }

    await user.save();
    res.json(user.watchlist);
});