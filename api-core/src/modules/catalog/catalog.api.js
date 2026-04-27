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

    // ✅ NUEVO: Buscar por ID de TMDB (lo que suele devolver la IA)
    getRecommendedContent: async (tmdbIds) => {
        return await Movie.find({ tmdbId: { $in: tmdbIds } }).limit(10);
    }
};