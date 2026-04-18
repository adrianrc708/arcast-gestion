const User = require('../models/user.model');
const Review = require('../models/review.model');

// Obtener datos del usuario logueado (para pág. "Account")
exports.getMe = async (req, res) => {
    try {
        // req.user.id viene del middleware 'requiredAuth'
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Actualizar datos del usuario (para pág. "Account")
exports.updateMe = async (req, res) => {
    const { username, email } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        user.username = username || user.username;
        user.email = email || user.email;

        // (Opcional: agregar lógica para cambiar contraseña)

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Obtener todas las reseñas del usuario logueado (para pág. "Profile")
exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- NUEVA FUNCIÓN: Agregar a Watchlist ---
exports.addToWatchlist = async (req, res) => {
    const { movieId } = req.body;
    try {
        const user = await User.findById(req.user.id);

        // Evitar duplicados
        if (user.watchlist.includes(movieId)) {
            return res.status(400).json({ message: 'Esta película ya está en tu watchlist.' });
        }

        user.watchlist.push(movieId);
        await user.save();
        res.json(user.watchlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- NUEVA FUNCIÓN: Obtener Watchlist ---
exports.getWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('watchlist');
        // .populate('watchlist') reemplaza los IDs con los objetos completos de Película

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};