import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, logout } = useAuth(); // Importamos logout del contexto

    const isMainView = location.pathname === '/' || location.pathname.startsWith('/item');
    const currentView = searchParams.get('view') || 'home';
    const currentType = searchParams.get('type') || 'movies';

    // Estados para el buscador
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchDropdownRef = useRef(null);

    // Estado para el menú de usuario (Logout/Perfil)
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    const goHome = () => navigate('/');
    const goCatalog = (type) => navigate(`/?view=catalog&type=${type}`);

    // Búsqueda en tiempo real
    useEffect(() => {
        if (searchTerm.length > 2) {
            Promise.all([
                api.get('/catalog/movies', { params: { search: searchTerm } }),
                api.get('/catalog/tvshows', { params: { search: searchTerm } })
            ]).then(([moviesRes, tvRes]) => {
                const combined = [
                    ...moviesRes.data.map(i => ({ ...i, mediaType: 'movie' })),
                    ...tvRes.data.map(i => ({ ...i, mediaType: 'tvshow' }))
                ];
                setSearchResults(combined.slice(0, 5));
                setShowSearchDropdown(true);
            }).catch(() => setShowSearchDropdown(false));
        } else {
            setShowSearchDropdown(false);
        }
    }, [searchTerm]);

    // Cerrar desplegables al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/login');
    };

    return (
        <header className="main-header">
            <Link to="/" className="logo-container" onClick={goHome}>
                <img src="/favicon.svg" alt="Arcast Logo" className="logo-img" />
                <span className="logo-text">ARCAST<span className="accent-dot">.</span></span>
            </Link>

            {isMainView && (
                <div className="navbar-filters">
                    <div className="nav-links">
                        <button className={currentView === 'catalog' && currentType === 'movies' ? 'active' : ''} onClick={() => goCatalog('movies')}>Películas</button>
                        <button className={currentView === 'catalog' && currentType === 'tvshows' ? 'active' : ''} onClick={() => goCatalog('tvshows')}>Series</button>
                    </div>

                    <div className="search-container-live" ref={searchDropdownRef}>
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar título..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm.length > 2 && setShowSearchDropdown(true)}
                            />
                        </div>

                        {showSearchDropdown && (
                            <div className="search-dropdown">
                                {searchResults.length > 0 ? (
                                    searchResults.map(item => (
                                        <div key={item._id} className="search-item" onClick={() => {
                                            setShowSearchDropdown(false);
                                            setSearchTerm('');
                                            navigate(`/item/${item.mediaType}/${item._id}`);
                                        }}>
                                            <img src={item.posterUrl} alt={item.title || item.name} />
                                            <div className="search-item-info">
                                                <h4>{item.title || item.name}</h4>
                                                <span>{item.releaseDate?.split('-')[0]} • {item.mediaType === 'movie' ? 'Película' : 'Serie'}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="search-item-empty">No se encontraron resultados</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="user-controls" ref={userMenuRef}>
                {user ? (
                    <div className="relative">
                        <button
                            className="profile-pill-premium"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{ cursor: 'pointer', border: 'none' }}
                        >
                            <div className="avatar-gradient">
                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="username-premium hidden-mobile">{user.username || 'Usuario'}</span>
                        </button>

                        {showUserMenu && (
                            <div className="profile-dropdown-menu">
                                <Link to="/profile" onClick={() => setShowUserMenu(false)}>👤 Mi Perfil</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setShowUserMenu(false)}>⚙️ Panel Admin</Link>
                                )}
                                <hr style={{ opacity: 0.1, margin: '8px 0' }} />
                                <button
                                    onClick={handleLogout}
                                    style={{ color: '#ff4d4d' }}
                                >
                                    🚪 Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="hero-btn" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>Ingresar</Link>
                )}
            </div>
        </header>
    );
};

export default Navbar;