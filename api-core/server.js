const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

const app = express();

// 1. Conexión a la base de datos
connectDB();

// 2. Middlewares globales
app.use(cors());
app.use(express.json());

// 3. Montaje de Módulos (Puntos de entrada únicos)
// Cada carpeta tiene su propio index.js que gestiona sus rutas internas
app.use('/api/auth', require('./src/modules/auth'));
app.use('/api/catalog', require('./src/modules/catalog'));

// Servicios que aún no se han movido a módulos
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/user', require('./routes/user.routes'));

// 4. Configuración del Puerto (5001 para evitar conflictos)
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`🚀 API-CORE: http://localhost:${PORT}`);
    console.log(`🤖 AI-ENGINE: http://localhost:8001`);
    console.log(`🌐 UI-WEB:    http://localhost:5173`);
    console.log(`==========================================`);
});