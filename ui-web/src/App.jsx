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

import './index.css'; //Por si a caso, no funcionaba en el main.jsx, lo dejo aquí para asegurarme de que se cargue.

const App = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Auth />;

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/item/:type/:id" element={<MovieDetails />} />
                    <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} />
                    <Route path="/boss" element={user?.role === 'boss' ? <BossDashboard /> : <Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route path="/admin" element={user?.role === 'admin' || user?.role === 'boss' ? <AdminPanel /> : <Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;