/**
 * @type {any}
 */
const Movie = require('./movie.model');

/**
 * Crea una nueva película en la base de datos.
 */
exports.create = async (data) => {
    return new Movie(data).save();
};

/**
 * Busca todas las películas aplicando filtros y ordenamiento.
 */
exports.findAll = async (query, sort, search) => {
    if (!sort && !search) {
        // noinspection JSUnresolvedFunction
        const movies = await Movie.find(query);
        return movies.sort(() => Math.random() - 0.5);
    }

    let sortOption = { _id: -1 };
    if (sort === 'rating') sortOption = { voteAverage: -1 };
    if (sort === 'newest') sortOption = { releaseDate: -1 };

    // noinspection JSUnresolvedFunction
    return Movie.find(query).sort(sortOption);
};

/**
 * Busca una película por su ID único.
 */
exports.findById = async (id) => {
    // noinspection JSUnresolvedFunction
    return Movie.findById(id);
};

exports.update = async (id, data) => Movie.findByIdAndUpdate(id, data, { new: true });
exports.delete = async (id) => Movie.findByIdAndDelete(id);