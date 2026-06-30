import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import api from './services/api';

import ContinueWatching from './views/ContinueWatching';
import History from './views/History';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Home from './views/Home';
import AdminPanel from './views/AdminPanel';
import MovieDetails from './views/MovieDetails';
import Profile from './views/Profile';
import SemanticSearch from './views/SemanticSearch';
import './index.css';

const BossDashboard = lazy(() => import('./views/BossDashboard'));

const App = () => {
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        api.get('/system/config')
            .then(res => {
                const config = Array.isArray(res.data) ? res.data[0] : res.data;
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
            .catch(err => console.error('Error:', err));
    }, []);

    if (!isAuthenticated) return <Auth />;

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                <Routes>
                    <Route path="/" element={
                        user?.role === 'admin' ? <Navigate to="/admin" replace /> :
                            user?.role === 'boss' ? <Navigate to="/boss" replace /> :
                                <Home />
                    } />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/item/:type/:id" element={<MovieDetails />} />
                    <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} />
                    <Route path="/semantic-search" element={<SemanticSearch />} />
                    <Route path="/boss" element={
                        user?.role === 'boss' ? (
                            <Suspense fallback={<div className="py-20 text-center text-purple-400 font-bold animate-pulse">Iniciando módulos...</div>}>
                                <BossDashboard />
                            </Suspense>
                        ) : <Navigate to="/" replace />
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route path="/continue-watching" element={<ContinueWatching />} />
                    <Route path="/history" element={<History />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;