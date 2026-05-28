// Ruta: api-core/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/common/db');

const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// --- REGISTRO DE MÓDULOS (MONOLITO MODULAR) ---
app.use('/api/auth', require('./src/modules/auth'));
app.use('/api/users', require('./src/modules/users'));
app.use('/api/catalog', require('./src/modules/catalog'));
app.use('/api/reviews', require('./src/modules/reviews'));
// ✅ NUEVO: Módulo de Sistema para Vista Administrador
app.use('/api/system', require('./src/modules/system'));

// RUTA TEMPORAL - BORRAR DESPUÉS
app.get('/api/make-me-admin/:username', async (req, res) => {
    const User = require('./src/modules/users/user.model');
    await User.updateOne({ username: req.params.username }, { $set: { role: 'admin' } });
    res.json({ ok: true });
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Servidor Arcast corriendo en puerto ${PORT}`));