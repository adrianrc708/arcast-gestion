const Movie = require('./movie.model');

exports.create = async (data) => {
    return await new Movie(data).save();
};

exports.findAll = async (query, sort, search) => {
    if (!sort && !search) {
        const movies = await Movie.find(query);
        return movies.sort(() => Math.random() - 0.5);
    }

    let sortOption = { _id: -1 };
    if (sort === 'rating') sortOption = { voteAverage: -1 };
    if (sort === 'newest') sortOption = { releaseDate: -1 };

    return await Movie.find(query).sort(sortOption);
};

exports.findById = async (id) => {
    return await Movie.findById(id);
};