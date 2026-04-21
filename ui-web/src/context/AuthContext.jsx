import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('arcast_user');
        if (saved) {
            try { setUser(JSON.parse(saved)); } catch { localStorage.clear(); }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('arcast_token', data.token);
            localStorage.setItem('arcast_user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (err) { return { success: false, message: err.message }; }
    };

    const register = async (username, email, password) => {
        try {
            await api.post('/auth/register', { username, email, password });
            return await login(email, password); // Auto-login tras registrarse
        } catch (err) { return { success: false, message: err.message }; }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.reload();
    };

    const value = useMemo(() => ({ user, login, register, logout, isAuthenticated: !!user }), [user]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);