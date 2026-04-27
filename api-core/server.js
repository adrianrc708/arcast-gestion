require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/common/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// MÓDULOS DEL SISTEMA
app.use('/api/auth', require('./src/modules/auth'));
app.use('/api/users', require('./src/modules/users'));
app.use('/api/catalog', require('./src/modules/catalog'));
app.use('/api/reviews', require('./src/modules/reviews'));
app.use('/api/system', require('./src/modules/system')); // ✅ Activado

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend Arcast listo en puerto ${PORT}`));