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

const App = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Auth />;

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                <Routes>
                    {/* REDIRECCIÓN DIRECTA: Sin funciones externas que causen crasheos */}
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