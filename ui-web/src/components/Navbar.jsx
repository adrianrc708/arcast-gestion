import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 w-full bg-[#0d1117]/80 backdrop-blur-xl border-b border-[#30363d] z-[100] h-16">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* LOGO */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 bg-gradient-to-tr from-[#58a6ff] to-[#8957e5] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.5 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM14.5 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">ARCAST</span>
                </Link>

                {/* MENU DESKTOP */}
                <div className="hidden md:flex items-center space-x-1">
                    <Link to="/" className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${isActive('/') ? 'bg-[#58a6ff]/10 text-[#58a6ff]' : 'text-gray-400 hover:text-white'}`}>Catálogo</Link>
                    {user ? (
                        <div className="flex items-center gap-1">
                            <Link to="/profile" className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${isActive('/profile') ? 'bg-[#58a6ff]/10 text-[#58a6ff]' : 'text-gray-400 hover:text-white'}`}>Mi Perfil</Link>

                            {user.role === 'admin' && <Link to="/admin" className="px-4 py-2 text-xs font-black uppercase text-red-400 hover:bg-red-500/10 rounded-lg">Panel Admin</Link>}
                            {user.role === 'boss' && <Link to="/boss" className="px-4 py-2 text-xs font-black uppercase text-purple-400 hover:bg-purple-500/10 rounded-lg">Métricas</Link>}

                            <div className="w-px h-6 bg-[#30363d] mx-4"></div>

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden lg:block">
                                    <p className="text-[10px] font-black text-white leading-none mb-1">{user.username}</p>
                                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{user.role}</p>
                                </div>
                                <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all">SALIR</button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/auth" className="ml-4 bg-white text-black font-black px-6 py-2 rounded-xl text-xs tracking-widest hover:scale-105 transition-all">ACCEDER</Link>
                    )}
                </div>

                {/* MOBILE BUTTON */}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-400 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 w-full bg-[#0d1117] border-b border-[#30363d] p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="p-3 text-sm font-bold text-white hover:bg-[#161b22] rounded-xl">Catálogo</Link>
                    {user && <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="p-3 text-sm font-bold text-white hover:bg-[#161b22] rounded-xl">Mi Perfil</Link>}
                    {user?.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="p-3 text-sm font-bold text-red-400 rounded-xl">Panel Admin</Link>}
                    {user?.role === 'boss' && <Link to="/boss" onClick={() => setIsMenuOpen(false)} className="p-3 text-sm font-bold text-purple-400 rounded-xl">Métricas</Link>}
                    {user && <button onClick={handleLogout} className="p-3 text-sm font-bold text-left text-red-500 border-t border-[#30363d] mt-2">Cerrar Sesión</button>}
                </div>
            )}
        </nav>
    );
};

export default Navbar;