const User = require('../../common/models/user.model');

module.exports = {
    findByEmailOrUsername: async (email, username) => {
        return await User.findOne({ $or: [{ email }, { username }] });
    },
    findByEmail: async (email) => {
        return await User.findOne({ email });
    },
    createUser: async (userData) => {
        const user = new User(userData);
        return await user.save();
    }
};