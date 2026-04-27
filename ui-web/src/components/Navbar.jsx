import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <nav className="bg-[#0d1117] border-b border-[#30363d] h-16 flex items-center px-6 sticky top-0 z-50">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                <div className="flex items-center space-x-8">
                    {/* El logo lleva a la raíz, que ahora redirige inteligentemente */}
                    <Link to="/" className="text-xl font-black tracking-tighter text-white">ARCAST</Link>

                    <div className="flex space-x-6">
                        {/* Solo 'user' ve Explorar */}
                        {user?.role === 'user' && (
                            <Link to="/" className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? 'text-[#58a6ff]' : 'text-gray-400 hover:text-white'}`}>Explorar Catálogo</Link>
                        )}

                        {/* Solo 'admin' ve su panel */}
                        {user?.role === 'admin' && (
                            <Link to="/admin" className={`text-sm font-semibold transition-colors ${location.pathname === '/admin' ? 'text-[#58a6ff]' : 'text-gray-400 hover:text-white'}`}>Panel de Control</Link>
                        )}

                        {/* Solo 'boss' ve métricas */}
                        {user?.role === 'boss' && (
                            <Link to="/boss" className={`text-sm font-semibold transition-colors ${location.pathname === '/boss' ? 'text-[#58a6ff]' : 'text-gray-400 hover:text-white'}`}>Métricas Globales</Link>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-white">{user?.username}</p>
                        <p className="text-[10px] text-[#58a6ff] font-mono uppercase tracking-widest">{user?.role}</p>
                    </div>
                    <button onClick={logout} className="text-xs text-red-400 font-bold border border-red-400/20 px-3 py-1.5 rounded hover:bg-red-400/10 transition-all">
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;