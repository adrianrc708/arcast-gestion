require('dotenv').config();
const express = require('express');
const cors = require('cors');

/**
 * @type {function(): void}
 */
const connectDB = (/** @type {any} */ (require('./src/common/db')));

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

/** @type {any} */
const authModule = require('./src/modules/auth');
/** @type {any} */
const usersModule = require('./src/modules/users');
/** @type {any} */
const catalogModule = require('./src/modules/catalog');
/** @type {any} */
const reviewsModule = require('./src/modules/reviews');
/** @type {any} */
const systemModule = require('./src/modules/system');

// noinspection JSCheckFunctionSignatures
app.use('/api/auth', authModule);
// noinspection JSCheckFunctionSignatures
app.use('/api/users', usersModule);
// noinspection JSCheckFunctionSignatures
app.use('/api/catalog', catalogModule);
// noinspection JSCheckFunctionSignatures
app.use('/api/reviews', reviewsModule);
// noinspection JSCheckFunctionSignatures
app.use('/api/system', systemModule);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend Arcast listo en puerto ${PORT}`));