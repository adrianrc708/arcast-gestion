const Movie = require('./movie.model');
const TVShow = require('./tvshow.model');

module.exports = {
    getMovieById: async (id) => { return await Movie.findById(id); },
    getTVShowById: async (id) => { return await TVShow.findById(id); },

    getBulkItems: async (movieIds, tvIds) => {
        const [movies, tvshows] = await Promise.all([
            Movie.find({ _id: { $in: movieIds } }),
            TVShow.find({ _id: { $in: tvIds } })
        ]);
        return { movies, tvshows };
    },

    getRecommendedContent: async (tmdbIds) => {
        // Si no hay IDs, devolvemos las 10 mejores calificadas como fallback
        if (!tmdbIds || tmdbIds.length === 0) {
            return await Movie.find().sort({ voteAverage: -1 }).limit(10);
        }
        return await Movie.find({ tmdbId: { $in: tmdbIds } }).limit(10);
    }
};