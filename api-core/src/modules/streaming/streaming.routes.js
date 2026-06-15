const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const controller = require('./streaming.controller');

// El tag <video> no puede enviar headers personalizados, por lo que
// el token se acepta también como query param: ?token=<jwt>
const streamAuth = (req, res, next) => {
    const header = req.header('x-auth-token') || req.header('Authorization');
    const raw    = header
        ? (header.startsWith('Bearer ') ? header.slice(7) : header)
        : req.query.token;

    if (!raw) return res.status(401).json({ message: 'No hay token.' });

    try {
        req.user = jwt.verify(raw, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: 'Token no válido.' });
    }
};

router.get('/movie/:id',                              streamAuth, controller.streamMovie);
router.get('/episode/:tvshowId/:season/:episode',     streamAuth, controller.streamEpisode);

module.exports = router;
