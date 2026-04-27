const jwt = require('jsonwebtoken');


exports.requiredAuth = (req, res, next) => {
    const token = req.header('x-auth-token') || req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'No hay token.' });

    try {
        const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
        req.user = jwt.verify(tokenString, process.env.JWT_SECRET);
        next();
    } catch (err) { res.status(401).json({ message: 'Token no válido.' }); }
};


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