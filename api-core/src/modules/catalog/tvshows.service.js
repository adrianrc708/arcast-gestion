/**
 * @type {any}
 */
const TVShow = require('./tvshow.model');

/**
 * Busca todas las series aplicando filtros y ordenamiento.
 */
exports.findAll = async (query, sortOption) => {
    // noinspection JSUnresolvedFunction
    return TVShow.find(query).sort(sortOption);
};

/**
 * Busca una serie por su ID único.
 */
exports.findById = async (id) => {
    // noinspection JSUnresolvedFunction
    return TVShow.findById(id);
};