const express = require('express');
const cors = require('cors');
const connectDB = require('./src/common/db');
require('dotenv').config();

const app = express();

// 1. Conexión a la base de datos
connectDB();

// 2. Middlewares globales
app.use(cors());
app.use(express.json());

// 3. Orquestación de Módulos (Puntos de entrada únicos)
app.use('/api/auth', require('./src/modules/auth'));
app.use('/api/catalog', require('./src/modules/catalog'));
app.use('/api/reviews', require('./src/modules/reviews'));
app.use('/api/users', require('./src/modules/users'));

// 4. Manejador de errores centralizado
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: 'Error interno en el módulo',
        message: err.message
    });
});

// 5. Configuración del Puerto
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`🚀 API-CORE: http://localhost:${PORT}`);
    console.log(`==========================================`);
});