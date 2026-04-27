const User = require('./user.model'); // ✅ Importación corregida a su propio módulo

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