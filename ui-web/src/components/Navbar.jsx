import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const isMainView = location.pathname === '/' || location.pathname.startsWith('/item');
    const currentView = searchParams.get('view') || 'home';
    const currentType = searchParams.get('type') || 'movies';

    // Estados para el buscador en vivo
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const goHome = () => navigate('/');
    const goCatalog = (type) => navigate(`/?view=catalog&type=${type}`);

    // Búsqueda en tiempo real
    useEffect(() => {
        if (searchTerm.length > 2) {
            // Buscamos en películas y series al mismo tiempo
            Promise.all([
                api.get('/catalog/movies', { params: { search: searchTerm } }),
                api.get('/catalog/tvshows', { params: { search: searchTerm } })
            ]).then(([moviesRes, tvRes]) => {
                const combined = [
                    ...moviesRes.data.map(i => ({ ...i, mediaType: 'movie' })),
                    ...tvRes.data.map(i => ({ ...i, mediaType: 'tvshow' }))
                ];
                setSearchResults(combined.slice(0, 5)); // Mostramos solo los 5 mejores resultados
                setShowDropdown(true);
            }).catch(() => setShowDropdown(false));
        } else {
            setShowDropdown(false);
        }
    }, [searchTerm]);

    // Cerrar desplegable al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

                    {/* Buscador Desplegable */}
                    <div className="search-container-live" ref={dropdownRef}>
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar título..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
                            />
                        </div>

                        {showDropdown && (
                            <div className="search-dropdown">
                                {searchResults.length > 0 ? (
                                    searchResults.map(item => (
                                        <div key={item._id} className="search-item" onClick={() => {
                                            setShowDropdown(false);
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

            <div className="user-controls">
                <Link to="/profile" className="profile-pill-premium">
                    <div className="avatar-gradient">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="username-premium hidden-mobile">{user?.name || 'Perfil'}</span>
                </Link>
            </div>
        </header>
    );
};

export default Navbar;