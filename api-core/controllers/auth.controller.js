const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'El email o usuario ya existe.' });
        }

        user = new User({ username, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Iniciar sesión
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // Crear y enviar el token
        const payload = {
            id: user._id,
            username: user.username
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};