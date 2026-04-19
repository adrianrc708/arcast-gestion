const moviesService = require('./movies.service');
const tvshowsService = require('./tvshows.service');
const Movie = require('./movie.model');
const TVShow = require('./tvshow.model');

module.exports = {
    getMovieById: async (id) => {
        return await moviesService.findById(id);
    },
    getTVShowById: async (id) => {
        return await tvshowsService.findById(id);
    },
    // ✅ OPTIMIZACIÓN: Método para obtener muchos elementos de golpe
    // Esto evita que el módulo de usuarios tenga que llamar a la DB 50 veces en un bucle.
    getBulkItems: async (movieIds, tvshowIds) => {
        const [movies, tvshows] = await Promise.all([
            Movie.find({ _id: { $in: movieIds } }),
            TVShow.find({ _id: { $in: tvshowIds } })
        ]);
        return { movies, tvshows };
    }
};