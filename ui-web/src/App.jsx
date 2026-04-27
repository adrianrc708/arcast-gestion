import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Home from './views/Home';
import AdminPanel from './views/AdminPanel';
import BossDashboard from './views/BossDashboard';
import MovieDetails from './views/MovieDetails';
import Profile from './views/Profile';

const AppContent = () => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-[#58a6ff] font-bold animate-pulse">Validando sesión...</div>;

    if (!isAuthenticated) return <Auth />;

    // LÓGICA REALISTA: Redirigir a la landing correcta según el rol
    const getLandingRoute = () => {
        if (user?.role === 'admin') return <Navigate to="/admin" replace />;
        if (user?.role === 'boss') return <Navigate to="/boss" replace />;
        return <Home />; // Solo los usuarios normales ven el catálogo
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans selection:bg-[#58a6ff] selection:text-white flex flex-col">
            <Navbar />
            <main className="flex-1 pt-20 pb-12">
                <Routes>
                    {/* Ruta Raíz Dinámica */}
                    <Route path="/" element={getLandingRoute()} />

                    {/* Rutas para Usuarios Normales */}
                    {user?.role === 'user' && (
                        <Route path="/:type/:id" element={<MovieDetails />} />
                    )}

                    {/* NUEVA RUTA: Perfil de Usuario (Accesible para todos los roles logueados) */}
                    <Route path="/profile" element={<Profile />} />

                    {/* Rutas Exclusivas para Admin */}
                    <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} />

                    {/* Rutas Exclusivas para Boss */}
                    <Route path="/boss" element={user?.role === 'boss' ? <BossDashboard /> : <Navigate to="/" replace />} />

                    {/* Fallback general */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <footer className="py-8 border-t border-[#30363d] text-center mt-auto">
                <p className="text-xs text-gray-600 font-medium tracking-widest uppercase">
                    &copy; {new Date().getFullYear()} Arcast System
                </p>
            </footer>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

export default App;