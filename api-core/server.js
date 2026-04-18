const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/movies', require('./routes/movies.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));

// --- NUEVAS RUTAS ---
app.use('/api/import', require('./routes/import.routes'));

// --- NUEVA RUTA ---
app.use('/api/tvshows', require('./routes/tvshows.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
// --- FIN NUEVAS RUTAS ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend (Node.js) corriendo en puerto ${PORT}`));