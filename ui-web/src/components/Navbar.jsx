import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ setView, currentView }) => {
    const { user, logout } = useAuth();

    const items = [
        { id: 'home', label: 'Explore', roles: ['user', 'admin', 'boss'] },
        { id: 'admin', label: 'Admin', roles: ['admin'] },
        { id: 'boss', label: 'Dashboard', roles: ['boss'] },
    ];

    return (
        <nav className="bg-[#0d1117] border-b border-[#30363d] h-20 flex items-center px-8 sticky top-0 z-50">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                <div className="flex items-center space-x-12">
                    <span className="text-2xl font-bold tracking-tighter text-white cursor-pointer" onClick={() => setView('home')}>ARCAST</span>
                    <div className="flex space-x-8">
                        {items.map(item => item.roles.includes(user?.role) && (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`text-sm font-semibold transition-colors ${
                                    currentView === item.id ? 'text-[#58a6ff]' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-white">{user?.username}</p>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{user?.role}</p>
                    </div>
                    <button onClick={logout} className="text-xs text-red-400 font-bold border border-red-400/20 px-4 py-2 rounded-lg hover:bg-red-400/10 transition-all">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;