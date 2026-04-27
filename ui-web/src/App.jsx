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

    // Pantalla de carga profesional para evitar saltos visuales
    if (loading) return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-[#58a6ff] font-bold">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
                <span className="tracking-widest uppercase text-xs">Verificando Credenciales...</span>
            </div>
        </div>
    );

    if (!isAuthenticated) return <Auth />;

    // LÓGICA DE REDIRECCIÓN POR ROL:
    // El administrador y el jefe son enviados a sus paneles por defecto al entrar a la raíz.
    const getLandingRoute = () => {
        if (user?.role === 'admin') return <Navigate to="/admin" replace />;
        if (user?.role === 'boss') return <Navigate to="/boss" replace />;
        return <Home />;
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans selection:bg-[#58a6ff] selection:text-white flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                <Routes>
                    {/* Ruta Raíz Dinámica basada en el Rol */}
                    <Route path="/" element={getLandingRoute()} />

                    {/* Ruta de Perfil: Accesible para todos los usuarios logueados */}
                    <Route path="/profile" element={<Profile />} />

                    {/* Ruta de Detalles: El usuario normal la usa para ver contenido */}
                    <Route path="/:type/:id" element={<MovieDetails />} />

                    {/* Rutas Protegidas por Interfaz */}
                    <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} />
                    <Route path="/boss" element={user?.role === 'boss' ? <BossDashboard /> : <Navigate to="/" replace />} />

                    {/* Fallback para rutas inexistentes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <footer className="py-8 border-t border-[#30363d] text-center mt-auto bg-[#0d1117]">
                <p className="text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase">
                    &copy; {new Date().getFullYear()} Arcast System &bull; Intelligent Streaming Engine
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