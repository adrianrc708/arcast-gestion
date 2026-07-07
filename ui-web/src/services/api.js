import axios from 'axios';

/**
 * En desarrollo: Vite proxea /api → http://localhost:5001  (vite.config.js)
 * En producción: nginx proxea /api → http://api-core:5001  (nginx.conf)
 *
 * VITE_API_URL puede sobreescribirse con un .env local para apuntar
 * a un backend remoto (ej: VITE_API_URL=https://api.mi-dominio.com/api).
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('arcast_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        // Token expirado o inválido: limpiamos la sesión para no dejar al
        // usuario en un estado inconsistente (seguirá logueado en la UI pero
        // todas las llamadas fallarían con 401).
        if (err.response?.status === 401) {
            localStorage.removeItem('arcast_token');
        }
        const msg = err.response?.data?.message || err.message || 'Error de conexión';
        return Promise.reject({ message: String(msg) });
    }
);

export default api;