require('dotenv').config();
const express = require('express');
const cors    = require('cors');

/** @type {function(): void} */
const connectDB = (/** @type {any} */ (require('./src/common/db')));
const { AppError } = require('./src/common/error.utils');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.get('/api/system/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));
// ─── Módulos de negocio ────────────────────────────────────────────────────
/** @type {any} */ const authModule    = require('./src/modules/auth');
/** @type {any} */ const usersModule   = require('./src/modules/users');
/** @type {any} */ const catalogModule = require('./src/modules/catalog');
/** @type {any} */ const reviewsModule = require('./src/modules/reviews');
/** @type {any} */ const systemModule  = require('./src/modules/system');

// noinspection JSCheckFunctionSignatures
app.use('/api/auth',    authModule);
// noinspection JSCheckFunctionSignatures
app.use('/api/users',   usersModule);
// noinspection JSCheckFunctionSignatures
app.use('/api/catalog', catalogModule);
// noinspection JSCheckFunctionSignatures
app.use('/api/reviews', reviewsModule);
// noinspection JSCheckFunctionSignatures
app.use('/api/system',  systemModule);

// ─── 404 — Ruta no encontrada ──────────────────────────────────────────────
app.use((req, _res, next) => {
    next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
});

// ─── Manejador global de errores (centralizado) ────────────────────────────
/**
 * Express detecta un error handler por la aridad de 4 parámetros (err, req, res, next).
 * Todos los errores lanzados con `next(err)` o `throw` dentro de `catchAsync` llegan aquí.
 *
 * @type {import('express').ErrorRequestHandler}
 */
const globalErrorHandler = (err, req, res, _next) => {
    const status  = err.status     || 'error';
    const code    = err.statusCode || err.status || 500;
    const message = err.message    || 'Error interno del servidor';

    // Enriquecer log con contexto
    console.error(`[${new Date().toISOString()}] [${req.method} ${req.originalUrl}] ${code} — ${message}`);

    // En producción ocultamos el stack trace
    const isDevMode = process.env.NODE_ENV === 'development';

    (/** @type {any} */ (res)).status(code).json({
        status,
        message,
        ...(isDevMode && { stack: err.stack }),
    });
};

app.use(globalErrorHandler);

// ─── Inicio ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅  Backend Arcast listo en puerto ${PORT}`));