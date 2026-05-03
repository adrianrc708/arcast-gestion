import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const CarouselRow = ({ title, items, type }) => {
    const trackRef = useRef(null);
    const navigate = useNavigate();
    const scroll = (direction) => {
        if (trackRef.current) trackRef.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
    };
    if (!items || items.length === 0) return null;
    return (
        <div className="category-section">
            <div className="row-header"><h2 className="row-title">{title}</h2></div>
            <div className="carousel-wrapper">
                <button className="carousel-btn prev" onClick={() => scroll('left')}>&#10094;</button>
                <div className="carousel-track" ref={trackRef}>
                    {items.map(item => (
                        <div key={item._id} className="media-card" onClick={() => navigate(`/item/${type === 'movies' ? 'movie' : 'tvshow'}/${item._id}`)}>
                            <div className="poster-wrapper"><img src={item.posterUrl} alt={item.title || item.name} /></div>
                            <div className="card-info">
                                <h3>{item.title || item.name}</h3>
                                <div className="card-meta">
                                    <span>{item.releaseDate?.split('-')[0]}</span>
                                    <span className="score">★ {item.voteAverage?.toFixed(1) || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="carousel-btn next" onClick={() => scroll('right')}>&#10095;</button>
            </div>
        </div>
    );
};

const Home = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. AQUI VA EL ESTADO DE LAS RECOMENDACIONES
    const [recommendations, setRecommendations] = useState([]);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const view = searchParams.get('view') || 'home';
    const type = searchParams.get('type') || 'movies';
    const genre = searchParams.get('genre') || 'Todas';
    const sort = searchParams.get('sort') || 'newest';

    const [currentSlide, setCurrentSlide] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        setLoading(true);
        api.get(`/catalog/${type}`, { params: { genre, sort } })
            .then(res => setItems(res.data))
            .finally(() => setLoading(false));
    }, [type, genre, sort]);

    useEffect(() => { setCurrentPage(1); }, [type, genre, sort]);

    const heroItems = items.slice(0, 5);
    useEffect(() => {
        if (heroItems.length === 0 || view === 'catalog') return;
        const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % heroItems.length), 5000);
        return () => clearInterval(interval);
    }, [heroItems, view]);

    // 2. AQUI VA EL EFECTO QUE LLAMA A LA API DE LA IA
    useEffect(() => {
        const token = localStorage.getItem('arcast_token');
        if (token) {
            api.get('/users/recommendations')
                .then(res => setRecommendations(res.data))
                .catch(err => console.error(err));
        }
    }, []);

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== 'Todas') params.set(key, value);
        else params.delete(key);
        setSearchParams(params);
    };

    if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'}}>Cargando Catálogo...</div>;

    // VISTA 2: CATÁLOGO (Grid + Paginación)
    if (view === 'catalog') {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
        const totalPages = Math.ceil(items.length / itemsPerPage);

        return (
            <div style={{padding: '40px 5%', minHeight: '100vh'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px'}}>
                    <h2 style={{fontSize: '2rem', fontWeight: '800', margin: 0}}>
                        Catálogo de <span style={{color: 'var(--accent)'}}>{type === 'movies' ? 'Películas' : 'Series'}</span>
                    </h2>
                    <div className="filters-group">
                        <select className="filter-select" value={genre} onChange={(e) => updateFilter('genre', e.target.value)}>
                            <option value="Todas">Todos los Géneros</option>
                            <option value="Acción">Acción</option>
                            <option value="Aventura">Aventura</option>
                            <option value="Comedia">Comedia</option>
                        </select>
                        <select className="filter-select" value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                            <option value="newest">Más Recientes</option>
                            <option value="rating">Mejor Valoradas</option>
                        </select>
                    </div>
                </div>

                <div className="catalog-grid">
                    {currentItems.map(item => (
                        <div key={item._id} className="media-card" onClick={() => navigate(`/item/${type === 'movies' ? 'movie' : 'tvshow'}/${item._id}`)}>
                            <div className="poster-wrapper"><img src={item.posterUrl} alt={item.title || item.name} /></div>
                            <div className="card-info">
                                <h3>{item.title || item.name}</h3>
                                <div className="card-meta">
                                    <span>{item.releaseDate?.split('-')[0]}</span>
                                    <span className="score">★ {item.voteAverage?.toFixed(1) || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="pagination-container">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Anterior</button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Siguiente</button>
                    </div>
                )}
            </div>
        );
    }

    // VISTA 1: DASHBOARD
    const topRated = [...items].sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
    const recent = [...items].sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));

    return (
        <div style={{paddingBottom: '60px'}}>
            <div className="hero-container">
                {heroItems.map((item, index) => (
                    <div
                        key={item._id}
                        className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${item.backdropUrl || item.posterUrl})`, cursor: 'pointer' }}
                        onClick={() => navigate(`/item/${type === 'movies' ? 'movie' : 'tvshow'}/${item._id}`)}
                    >
                        <div className="hero-overlay">
                            <div className="hero-content">
                                <span className="hero-label">Destacado #{index + 1}</span>
                                <h1 className="hero-title">{item.title || item.name}</h1>
                                <p className="hero-desc">{item.overview || "Descubre esta increíble historia. Haz clic en la imagen o en el botón para ver todos los detalles y calificaciones."}</p>
                                <button
                                    className="hero-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/item/${type === 'movies' ? 'movie' : 'tvshow'}/${item._id}`);
                                    }}
                                >
                                    Ver Detalles
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="slider-dots">
                    {heroItems.map((_, index) => (
                        <div
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentSlide(index);
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* 3. AQUI VA EL RENDERIZADO VISUAL DE LA IA (Debajo del Hero y antes de las otras filas) */}
            {recommendations.length > 0 && (
                <CarouselRow title="Recomendaciones para ti" items={recommendations} type={type} />
            )}

            <CarouselRow title="Novedades Recientes" items={recent} type={type} />
            <CarouselRow title="Aclamadas por la Crítica" items={topRated} type={type} />
            <CarouselRow title="Explorar Catálogo" items={items} type={type} />
        </div>
    );
};

export default Home;