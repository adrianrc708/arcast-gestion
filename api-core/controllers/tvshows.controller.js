const TVShow = require('../models/tvshow.model');

// GET /api/tvshows -> listar con filtros y aleatoriedad
exports.getAllTVShows = async (req, res) => {
    try {
        const { genre, platform, sort, search } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (genre && genre !== 'Todas') {
            query.genres = genre;
        }

        if (platform && platform !== 'Todas') {
            query['platforms.name'] = { $regex: platform, $options: 'i' };
        }

        let shows;

        if (!sort && !search) {
            shows = await TVShow.find(query);
            shows = shows.sort(() => Math.random() - 0.5);
        } else {
            let sortOption = { _id: -1 };
            if (sort === 'rating') sortOption = { voteAverage: -1 };
            if (sort === 'newest') sortOption = { firstAirDate: -1 };

            shows = await TVShow.find(query).sort(sortOption);
        }

        res.json(shows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/tvshows/:id -> detalle de serie
exports.getTVShowById = async (req, res) => {
    try {
        const show = await TVShow.findById(req.params.id);
        if (!show) return res.status(404).json({ message: 'Serie no encontrada' });
        res.json(show);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};