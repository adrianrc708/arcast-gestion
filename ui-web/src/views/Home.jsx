import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import AIResultCard from '../components/AIResultCard'; // 🌟 1. IMPORTAMOS EL COMPONENTE IA

// 🌟 2. DATOS MOCKEADOS PARA EL HOME
const MOCK_AI_HOME_RECS = [
    { _id: '3', title: 'The Matrix', mediaType: 'movie', posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', releaseDate: '1999-03-30', voteAverage: 8.2, aiExplanation: 'Tu historial indica fascinación por mundos virtuales y filosofía cyberpunk.' },
    { _id: '4', title: 'Dark', mediaType: 'tvshow', posterUrl: 'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg', releaseDate: '2017-12-01', voteAverage: 8.4, aiExplanation: 'Ideal para tu próximo maratón de suspenso y saltos en el tiempo.' }
];

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
                            <div className="poster-wrapper">
                                <img src={item.posterUrl || 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Sin+Imagen'} alt={item.title || item.name} />
                            </div>
                            <div className="card-info">
                                <h3>{item.title || item.name}</h3>
                                <div className="card-meta">
                                    <span>{(item.releaseDate || item.firstAirDate)?.split('-')[0] || 'Año desconocido'}</span>
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
        const fetchCatalog = async () => {
            try {
                const params = { sort };
                if (genre && genre !== 'Todas') params.genre = genre;
                const endpoint = `/catalog/${type}`;
                const res = await api.get(endpoint, { params });
                setItems(res.data.results || res.data || []);
            } catch (err) {
                console.error("Error al cargar el catálogo:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalog();
    }, [type, genre, sort]);

    useEffect(() => { setCurrentPage(1); }, [type, genre, sort]);

    const heroItems = items.slice(0, 5);
    useEffect(() => {
        if (heroItems.length === 0 || view === 'catalog') return;
        const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % heroItems.length), 5000);
        return () => clearInterval(interval);
    }, [heroItems, view]);

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

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>Cargando Catálogo...</div>;

    if (view === 'catalog') {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
        const totalPages = Math.ceil(items.length / itemsPerPage);

        return (
            <div style={{ padding: '40px 5%', minHeight: '100vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                        Catálogo de <span style={{ color: 'var(--accent)' }}>{type === 'movies' ? 'Películas' : 'Series'}</span>
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
                            <div className="poster-wrapper">
                                <img src={item.posterUrl || 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Sin+Imagen'} alt={item.title || item.name} />
                            </div>
                            <div className="card-info">
                                <h3>{item.title || item.name}</h3>
                                <div className="card-meta">
                                    <span>{(item.releaseDate || item.firstAirDate)?.split('-')[0] || 'Año desconocido'}</span>
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

    const topRated = [...items].sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
    const recent = [...items].sort((a, b) => new Date(b.releaseDate || b.firstAirDate || 0) - new Date(a.releaseDate || a.firstAirDate || 0));

    return (
        <div style={{ paddingBottom: '60px' }}>
            <div className="hero-container">
                {heroItems.map((item, index) => (
                    <div
                        key={item._id}
                        className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${item.backdropUrl || item.posterUrl || 'https://via.placeholder.com/1920x1080/111111/111111'})`, cursor: 'pointer' }}
                        onClick={() => navigate(`/item/${type === 'movies' ? 'movie' : 'tvshow'}/${item._id}`)}
                    >
                        <div className="hero-overlay">
                            <div className="hero-content">
                                <span className="hero-label">Destacado #{index + 1}</span>
                                <h1 className="hero-title">{item.title || item.name}</h1>
                                <p className="hero-desc">{item.overview || "Descubre esta increíble historia. Haz clic en la imagen o en el botón para ver todos los detalles."}</p>
                                <button className="hero-btn" onClick={(e) => { e.stopPropagation(); navigate(`/item/${type === 'movies' ? 'movie' : 'tvshow'}/${item._id}`); }}>
                                    Ver Detalles
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="slider-dots">
                    {heroItems.map((_, index) => (
                        <div key={index} className={`dot ${index === currentSlide ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}></div>
                    ))}
                </div>
            </div>

            {recommendations.length > 0 && <CarouselRow title="Recomendaciones para ti" items={recommendations} type={type} />}

            {/* 🌟 3. SECCIÓN DE RECOMENDACIONES DE LA IA EN EL HOME */}
            <div className="px-[5%] py-8">
                <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                    <span className="text-2xl">✨</span>
                    <h2 className="text-2xl font-black text-white m-0">Sugerencias Inteligentes</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {MOCK_AI_HOME_RECS.map(item => <AIResultCard key={item._id} item={item} />)}
                </div>
            </div>

            <CarouselRow title="Novedades Recientes" items={recent} type={type} />
            <CarouselRow title="Aclamadas por la Crítica" items={topRated} type={type} />
            <CarouselRow title="Explorar Catálogo" items={items} type={type} />
        </div>
    );
};

export default Home;