const express = require('express');
const cors = require('cors');
const connectDB = require('./src/common/db');
require('dotenv').config();

const app = express();

// 1. Conexión a BD
connectDB();

// 2. Middlewares globales
app.use(cors());
app.use(express.json());

// 3. Orquestación de Módulos (Puntos de entrada)
app.use('/api/auth', require('./src/modules/auth'));
app.use('/api/catalog', require('./src/modules/catalog'));
app.use('/api/reviews', require('./src/modules/reviews'));
app.use('/api/users', require('./src/modules/users'));

// 4. Manejador de Errores Global (Indispensable en Monolito Modular)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Error interno en el módulo',
        message: err.message
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Monolito Modular en puerto ${PORT}`);
});