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

// --- REGISTRO DE MÓDULOS (MONOLITO MODULAR) ---
app.use('/api/auth', require('./src/modules/auth'));
app.use('/api/users', require('./src/modules/users'));
app.use('/api/catalog', require('./src/modules/catalog'));
app.use('/api/reviews', require('./src/modules/reviews'));
// ✅ NUEVO: Módulo de Sistema para Vista Administrador
app.use('/api/system', require('./src/modules/system'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅  Backend Arcast listo en puerto ${PORT}`));
