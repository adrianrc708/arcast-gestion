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
// El módulo de Auth ya contiene sus propias rutas internas
app.use('/api/auth', require('./src/modules/auth'));

// Agrupamos todo lo relacionado al contenido en un solo prefijo
app.use('/api/catalog', require('./routes/movies.routes'));
app.use('/api/catalog/tv', require('./routes/tvshows.routes'));
app.use('/api/catalog/import', require('./routes/import.routes'));

// Otros servicios
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/user', require('./routes/user.routes'));

// 4. Configuración del Puerto
// Forzamos el 5001 para que no haya conflictos con React (5173) o la IA (8001)
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`🚀 API-CORE: http://localhost:${PORT}`);
    console.log(`🤖 AI-ENGINE: http://localhost:8001`);
    console.log(`🌐 UI-WEB:    http://localhost:5173`);
    console.log(`==========================================`);
});