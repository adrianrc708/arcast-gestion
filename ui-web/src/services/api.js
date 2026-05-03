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
    if (token) config.headers['x-auth-token'] = token;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) localStorage.clear();
        const msg = err.response?.data?.message || err.message || 'Error de conexión';
        return Promise.reject({ message: String(msg) });
    }
);

export default api;