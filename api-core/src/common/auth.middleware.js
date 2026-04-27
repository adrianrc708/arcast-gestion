const jwt = require('jsonwebtoken');

// Exportamos un objeto con la propiedad requiredAuth para que coincida con tus rutas
exports.requiredAuth = (req, res, next) => {
    const token = req.header('x-auth-token') || req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No hay token, autorización denegada.' });
    }

    try {
        const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token no válido.' });
    }
};