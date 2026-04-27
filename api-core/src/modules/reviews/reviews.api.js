const Review = require('./review.model');

module.exports = {
    getReviewsByUserId: async (userId) => {
        return await Review.find({ userId }).sort({ date: -1 });
    }
};
