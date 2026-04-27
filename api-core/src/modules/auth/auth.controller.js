const usersApi = require('../users/users.api'); // ✅ Usamos la API puente, no el modelo
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await usersApi.findByEmailOrUsername(email, username);
        if (user) return res.status(400).json({ message: 'El email o usuario ya existe.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await usersApi.createUser({ username, email, password: hashedPassword });

        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await usersApi.findByEmail(email);
        if (!user) return res.status(400).json({ message: 'Credenciales inválidas.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Credenciales inválidas.' });

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};