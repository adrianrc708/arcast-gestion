const express = require('express');
const cors = require('cors');
const connectDB = require('./src/common/db'); // Ruta actualizada
require('dotenv').config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Orquestación de Módulos
app.use('/api/auth', require('./src/modules/auth'));
app.use('/api/catalog', require('./src/modules/catalog'));
app.use('/api/reviews', require('./src/modules/reviews'));
app.use('/api/users', require('./src/modules/users'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Monolito Modular en puerto ${PORT}`));