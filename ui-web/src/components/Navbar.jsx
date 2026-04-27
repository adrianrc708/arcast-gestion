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
        <nav className="fixed top-0 w-full bg-[#0d1117]/90 backdrop-blur-md border-b border-[#30363d] z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-gradient-to-tr from-[#58a6ff] to-purple-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(88,166,255,0.4)]">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">ARCAST</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className={`text-sm font-bold transition-colors ${isActive('/') ? 'text-[#58a6ff]' : 'text-[#e6edf3] hover:text-[#58a6ff]'}`}>
                            Catálogo
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-6">
                                <Link to="/profile" className={`text-sm font-bold transition-colors ${isActive('/profile') ? 'text-[#58a6ff]' : 'text-[#e6edf3] hover:text-[#58a6ff]'}`}>
                                    Mi Perfil
                                </Link>

                                {user.role === 'admin' && (
                                    <Link to="/admin" className={`text-sm font-bold transition-colors ${isActive('/admin') ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}>
                                        Panel Admin
                                    </Link>
                                )}
                                {user.role === 'boss' && (
                                    <Link to="/boss" className={`text-sm font-bold transition-colors ${isActive('/boss') ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'}`}>
                                        Métricas Globales
                                    </Link>
                                )}

                                <div className="h-6 w-px bg-[#30363d] mx-2"></div>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end leading-tight">
                                        <span className="text-sm font-bold text-white">{user.username}</span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.role}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-white font-black text-xs">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-2 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        Salir
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/auth" className="bg-[#58a6ff] hover:bg-[#318bf8] text-[#0d1117] font-black px-5 py-2 rounded-lg transition-colors text-sm shadow-[0_0_15px_rgba(88,166,255,0.3)]">
                                INICIAR SESIÓN
                            </Link>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-[#0d1117] border-b border-[#30363d] shadow-2xl">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-white hover:bg-[#161b22]">
                            Catálogo
                        </Link>

                        {user ? (
                            <>
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-white hover:bg-[#161b22]">
                                    Mi Perfil
                                </Link>

                                {user.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-red-400 hover:bg-red-500/10">
                                        Panel Admin
                                    </Link>
                                )}
                                {user.role === 'boss' && (
                                    <Link to="/boss" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-purple-400 hover:bg-purple-500/10">
                                        Métricas Globales
                                    </Link>
                                )}
                                <div className="border-t border-[#30363d] my-4 pt-4 px-3 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-white font-black text-sm">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm leading-tight">{user.username}</p>
                                            <p className="text-gray-500 text-xs font-bold uppercase">{user.role}</p>
                                        </div>
                                    </div>
                                    <button onClick={handleLogout} className="bg-red-500/10 text-red-400 font-bold px-4 py-2 rounded-lg text-sm">
                                        Salir
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="pt-4 px-3">
                                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-[#58a6ff] text-[#0d1117] font-black px-5 py-3 rounded-xl">
                                    INICIAR SESIÓN
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;