const jwt = require('jsonwebtoken');

// Middleware de autenticación básica (ya lo tienes)
exports.requiredAuth = (req, res, next) => {
    const token = req.header('x-auth-token') || req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'No hay token.' });

    try {
        const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        req.user = decoded; // Contiene id, username y ROLE
        next();
    } catch (err) { res.status(401).json({ message: 'Token no válido.' }); }
};

// ✅ NUEVO: Middleware para validar ROLES (Calidad de Seguridad)
exports.authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`
            });
        }
        next();
    };
};