const moviesService = require('./movies.service');
const tvshowsService = require('./tvshows.service');

// Este archivo es el "contrato" del módulo Catalog con el resto de la app.
module.exports = {
    getMovieById: async (id) => {
        return await moviesService.findById(id);
    },
    getTVShowById: async (id) => {
        return await tvshowsService.findById(id);
    }
};