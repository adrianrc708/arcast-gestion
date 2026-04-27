const usersApi = require('../users/users.api');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string} role
 */

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await usersApi.findByEmailOrUsername(email, username);
        if (user) return res.status(400).json({ message: 'El email o usuario ya existe.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await usersApi.createUser({ username, email, password: hashedPassword });
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        /** @type {User|null} */
        const user = await (/** @type {Promise<User|null>} */ usersApi.findByEmail(email));

        if (!user) return res.status(400).json({ message: 'Credenciales inválidas.' });

        // noinspection JSUnresolvedVariable
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Credenciales inválidas.' });

        // noinspection JSUnresolvedVariable
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                // noinspection JSUnresolvedVariable
                id: user._id,
                // noinspection JSUnresolvedVariable
                username: user.username,
                // noinspection JSUnresolvedVariable
                email: user.email,
                // noinspection JSUnresolvedVariable
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};