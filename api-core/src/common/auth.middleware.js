const jwt = require('jsonwebtoken');

// En un monolito modular, el middleware común NO importa modelos de base de datos.
// Se basa 100% en descifrar el token, o en su defecto, usar una API puente.

module.exports = (req, res, next) => {
    // Obtener token del header (soporta 'x-auth-token' o 'Authorization: Bearer ...')
    const token = req.header('x-auth-token') || req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No hay token, autorización denegada.' });
    }

    try {
        const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

        // Asignamos el payload del token a req.user (sin tocar la DB)
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token no válido.' });
    }
};