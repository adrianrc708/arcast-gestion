import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
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