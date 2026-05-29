const tvshowsService = require('./tvshows.service');

exports.getAllTVShows = async (req, res) => {
    try {
        const { genre, platform, sort, search } = req.query;
        let query = {};

        if (search) query.name = { $regex: search, $options: 'i' };
        if (genre && genre !== 'Todas') query.genres = genre;
        if (platform && platform !== 'Todas') query['platforms.name'] = { $regex: platform, $options: 'i' };

        let shows;

        if (!sort && !search) {
            shows = await tvshowsService.findAll(query, { _id: -1 });
            shows = shows.sort(() => Math.random() - 0.5);
        } else {
            let sortOption = { _id: -1 };
            if (sort === 'rating') sortOption = { voteAverage: -1 };
            if (sort === 'newest') sortOption = { firstAirDate: -1 };

            shows = await tvshowsService.findAll(query, sortOption);
        }

        res.json(shows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTVShowById = async (req, res) => {
    try {
        const show = await tvshowsService.findById(req.params.id);
        if (!show) return res.status(404).json({ message: 'Serie no encontrada' });
        res.json(show);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTVShow = async (req, res) => {
    try {
        if (!req.body.tmdbId) {
            req.body.tmdbId = 'manual-' + Date.now();
        }
        const show = await tvshowsService.create(req.body);
        res.status(201).json(show);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTVShow = async (req, res) => {
    try {
        const show = await tvshowsService.update(req.params.id, req.body);
        if (!show) return res.status(404).json({ message: 'Serie no encontrada' });
        res.json(show);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteTVShow = async (req, res) => {
    try {
        await tvshowsService.delete(req.params.id);
        res.json({ message: 'Serie eliminada' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};