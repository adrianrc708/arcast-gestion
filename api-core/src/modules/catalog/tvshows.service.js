const TVShow = require('./tvshow.model');

exports.findAll = async (query, sortOption) => {
    return await TVShow.find(query).sort(sortOption);
};

exports.findById = async (id) => {
    return await TVShow.findById(id);
};
