import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Home from './views/Home';
import AdminPanel from './views/AdminPanel';
import BossDashboard from './views/BossDashboard';
import MovieDetails from './views/MovieDetails';
import Profile from './views/Profile';

const AppContent = () => {
    const { isAuthenticated, user } = useAuth();

    // Definimos la función que faltaba para que no de error rojo
    const getLandingRoute = () => {
        if (user?.role === 'admin') return <Navigate to="/admin" replace />;
        if (user?.role === 'boss') return <Navigate to="/boss" replace />;
        return <Home />;
    };

    // Si no está logueado, va directo al Auth (Login)
    if (!isAuthenticated) return <Auth />;

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                <Routes>
                    <Route path="/" element={getLandingRoute()} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/item/:type/:id" element={<MovieDetails />} />

                    <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} />
                    <Route path="/boss" element={user?.role === 'boss' ? <BossDashboard /> : <Navigate to="/" replace />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <footer className="py-8 border-t border-[#30363d] text-center mt-auto bg-[#0d1117]">
                <p className="text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase">
                    &copy; {new Date().getFullYear()} Arcast System &bull; Intelligent Streaming
                </p>
            </footer>
        </div>
    );
};

export default AppContent;