import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Home from './views/Home';
import AdminPanel from './views/AdminPanel';
import BossDashboard from './views/BossDashboard';
import MovieDetails from './views/MovieDetails'; // Nueva vista que crearemos

const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (loading) return null;

    // Si no está autenticado, mostramos la pantalla de Auth
    if (!isAuthenticated) return <Auth />;

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans selection:bg-[#58a6ff] selection:text-white">
            {/* Pasamos navigate para que el Navbar pueda cambiar de ruta */}
            <Navbar currentPath={location.pathname} navigate={navigate} />
            <main>
                <Routes>
                    <Route path="/" element={<Home navigate={navigate} />} />
                    <Route path="/movie/:id" element={<MovieDetails />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/boss" element={<BossDashboard />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <footer className="py-12 border-t border-[#30363d] mt-20 text-center">
                <p className="text-xs text-gray-600 font-medium tracking-widest uppercase">
                    &copy; {new Date().getFullYear()} Arcast Intelligence Unit
                </p>
            </footer>
        </div>
    );
};

const App = () => (
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
);

export default App;