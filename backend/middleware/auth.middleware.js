const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware de autenticación opcional
// Si hay token, verifica y adjunta datos de usuario.
// Si no hay token, simplemente continúa.
const optionalAuth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return next(); // No hay token, continuar sin autenticar
    }

    const token = authHeader.split(' ')[1]; // Formato "Bearer <token>"
    if (!token) {
        return next(); // Formato de header incorrecto, continuar
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adjuntar payload del token (ej. { id, username })
        next();
    } catch (err) {
        // Token inválido, pero no bloqueamos la petición
        console.warn("Token inválido recibido, continuando como anónimo.");
        next();
    }
};

// Middleware de autenticación REQUERIDA
// Si no hay token válido, bloquea la petición.
const requiredAuth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adjuntar payload del token
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token inválido.' });
    }
};


module.exports = { optionalAuth, requiredAuth };