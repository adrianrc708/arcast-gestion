const usersApi = require('../users/users.api');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { catchAsync, AppError } = require('../../common/error.utils');
const ALLOWED_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'unmsm.edu.pe'];
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    const emailParts = email.split('@');
    if (emailParts.length !== 2 || !ALLOWED_DOMAINS.includes(emailParts[1].toLowerCase())) {
        return next(new AppError('Registro denegado. Utiliza un dominio de correo válido o institucional.', 403));
    }

    const existing = await usersApi.findByEmailOrUsername(email, username);
    if (existing) return next(new AppError('El email o nombre de usuario ya están registrados.', 409));

    await usersApi.createUser({ username, email, password });
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

    if (!user.password) {
        return next(new AppError('Esta cuenta usa Google para iniciar sesión.', 401));
    }

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
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
});

exports.googleLogin = catchAsync(async (req, res, next) => {
    const { credential } = req.body;
    if (!credential) return next(new AppError('Token de Google requerido.', 400));

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name } = ticket.getPayload();

    let user = await usersApi.findByEmail(email);

    if (!user) {
        let username = (name || email.split('@')[0]).replace(/\s+/g, '_').toLowerCase();
        const taken = await usersApi.findByEmailOrUsername('', username);
        if (taken) username = username + '_' + Date.now().toString().slice(-4);
        user = await usersApi.createUser({ username, email, googleId });
    } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
    }

    const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
});