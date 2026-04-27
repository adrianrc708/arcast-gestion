const TVShow = require('./tvshow.model');

// Separamos la lógica de la base de datos del controlador
exports.findAll = async (query, sortOption) => {
    return await TVShow.find(query).sort(sortOption);
};

exports.findById = async (id) => {
    return await TVShow.findById(id);
};