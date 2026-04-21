import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Home from './views/Home';
import AdminPanel from './views/AdminPanel';
import BossDashboard from './views/BossDashboard';

const AppContent = () => {
    const { isAuthenticated, loading } = useAuth();
    const [view, setView] = useState('home');

    if (loading) return null;
    if (!isAuthenticated) return <Auth />;

    const renderView = () => {
        switch(view) {
            case 'admin': return <AdminPanel />;
            case 'boss': return <BossDashboard />;
            default: return <Home />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans selection:bg-[#58a6ff] selection:text-white">
            <Navbar setView={setView} currentView={view} />
            <main>
                {renderView()}
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
        <AppContent />
    </AuthProvider>
);

export default App;