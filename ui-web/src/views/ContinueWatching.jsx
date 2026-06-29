import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ContinueWatching = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/stream/continue-watching')
            .then(res => setItems(res.data?.data?.list || []))
            .catch(err => console.error('Error al cargar continuar viendo:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleRemove = async (entryId) => {
        // TODO: conectar con endpoint DELETE cuando Alexander lo implemente
        setItems(prev => prev.filter(i => i._id !== entryId));
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            Cargando...
        </div>
    );

    return (
        <div style={{ padding: '40px 5%', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                    Continuar <span style={{ color: 'var(--accent)' }}>viendo</span>
                </h2>
                {items.length > 0 && (
                    <span style={{ fontSize: '14px', color: '#666' }}>{items.length} títulos</span>
                )}
            </div>

            {items.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '80px 0', color: '#555' }}>
                    <span style={{ fontSize: '48px' }}>🎬</span>
                    <p style={{ fontSize: '15px', margin: 0 }}>Aún no tienes nada en progreso.</p>
                    <button className="hero-btn" onClick={() => navigate('/')}>
                        Explorar catálogo
                    </button>
                </div>
            ) : (
                <div className="catalog-grid">
                    {items.map(entry => {
                        const item = entry.item;
                        const type = entry.contentType === 'TVShow' ? 'tvshow' : 'movie';
                        if (!item) return null;

                        return (
                            <div
                                key={entry._id}
                                className="media-card"
                                onClick={() => navigate(`/item/${type}/${entry.contentId}`)}
                                style={{ position: 'relative' }}
                            >
                                <div className="poster-wrapper">
                                    <img
                                        src={item.posterUrl || 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Sin+Imagen'}
                                        alt={item.title || item.name}
                                    />
                                    {/* Barra de progreso */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0, left: 0, right: 0,
                                        height: '4px',
                                        background: 'rgba(255,255,255,0.15)'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min(entry.percentWatched, 100)}%`,
                                            background: 'var(--accent)',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>

                                <div className="card-info">
                                    <h3>{item.title || item.name}</h3>
                                    <div className="card-meta">
                                        <span style={{ color: 'var(--accent)' }}>{entry.percentWatched}% visto</span>
                                        <span className="score">★ {item.voteAverage?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Botón quitar */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemove(entry._id); }}
                                    style={{
                                        position: 'absolute', top: '8px', right: '8px',
                                        background: 'rgba(0,0,0,0.7)', border: 'none',
                                        color: '#ccc', width: '26px', height: '26px',
                                        borderRadius: '50%', fontSize: '12px', cursor: 'pointer',
                                        display: 'none', alignItems: 'center', justifyContent: 'center'
                                    }}
                                    className="remove-btn"
                                    title="Quitar"
                                >✕</button>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .media-card:hover .remove-btn { display: flex !important; }
            `}</style>
        </div>
    );
};

export default ContinueWatching;