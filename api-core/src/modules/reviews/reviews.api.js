const Review = require('./review.model');

// Única forma permitida en la que otros módulos pueden consultar reseñas
module.exports = {
    getReviewsByUserId: async (userId) => {
        return await Review.find({ userId }).sort({ date: -1 });
    }
};