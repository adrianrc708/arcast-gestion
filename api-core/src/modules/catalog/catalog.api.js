const moviesService = require('./movies.service');
const tvshowsService = require('./tvshows.service');

module.exports = {
    getMovieById: async (id) => {
        return await moviesService.findById(id);
    },
    getTVShowById: async (id) => {
        return await tvshowsService.findById(id);
    },
    // ✅ NUEVO: Método para obtener múltiples elementos de golpe (Evita el problema N+1)
    getBulkItems: async (movieIds, tvshowIds) => {
        const [movies, tvshows] = await Promise.all([
            require('./movie.model').find({ _id: { $in: movieIds } }),
            require('./tvshow.model').find({ _id: { $in: tvshowIds } })
        ]);
        return { movies, tvshows };
    }
};