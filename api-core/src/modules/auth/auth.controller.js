const usersApi = require('../users/users.api');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { catchAsync, AppError } = require('../../common/error.utils');

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string} role
 */

exports.registerUser = catchAsync(async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return next(new AppError('username, email y password son obligatorios.', 400));
    }

    const existing = await usersApi.findByEmailOrUsername(email, username);
    if (existing) return next(new AppError('El email o nombre de usuario ya están registrados.', 409));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await usersApi.createUser({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
});

exports.loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('email y password son obligatorios.', 400));
    }

    /** @type {User|null} */
    const user = await (/** @type {Promise<User|null>} */ usersApi.findByEmail(email));

    if (!user) return next(new AppError('Credenciales inválidas.', 401));

    // noinspection JSUnresolvedVariable
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new AppError('Credenciales inválidas.', 401));

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
});