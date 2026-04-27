const moviesService = require('./movies.service');
const tvshowsService = require('./tvshows.service'); // Lo crearemos en el siguiente paso

module.exports = {
    getMovieById: async (id) => {
        return await moviesService.findById(id);
    },
    getTVShowById: async (id) => {
        return await tvshowsService.findById(id);
    }
};
