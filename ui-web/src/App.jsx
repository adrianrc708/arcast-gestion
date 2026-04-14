import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import api from './services/api';

import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Home from './views/Home';
import AdminPanel from './views/AdminPanel';
import BossDashboard from './views/BossDashboard';
import MovieDetails from './views/MovieDetails';
import Profile from './views/Profile';

const App = () => {
    const { isAuthenticated, user } = useAuth();

    // NUEVO: Efecto que inyecta el CSS global sin importar si está logueado
    useEffect(() => {
        // CORRECCIÓN 1: La ruta exacta de tu backend
        api.get('/system/config')
            .then(res => {
                const config = Array.isArray(res.data) ? res.data[0] : res.data;
                // CORRECCIÓN 2: El nombre exacto de la variable en tu BD
                const customCSS = config?.customCSS;

                if (customCSS) {
                    let styleTag = document.getElementById('arcast-custom-css');
                    if (!styleTag) {
                        styleTag = document.createElement('style');
                        styleTag.id = 'arcast-custom-css';
                        document.head.appendChild(styleTag);
                    }
                    styleTag.innerHTML = customCSS;
                }
            })
            .catch(err => console.error('No se pudo cargar la configuración del sistema:', err));
    }, []); // Los corchetes vacíos hacen que se ejecute solo 1 vez al entrar a la página

    if (!isAuthenticated) return <Auth />;

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                <Routes>
                    <Route path="/" element={
                        user?.role === 'admin' ? <Navigate to="/admin" replace /> :
                            user?.role === 'boss'  ? <Navigate to="/boss" replace />  :
                                <Home />
                    } />

                    <Route path="/profile" element={<Profile />} />
                    <Route path="/item/:type/:id" element={<MovieDetails />} />
                    <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} />
                    <Route path="/boss" element={user?.role === 'boss' ? <BossDashboard /> : <Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;