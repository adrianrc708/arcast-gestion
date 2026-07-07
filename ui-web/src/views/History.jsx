import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DATE_RANGES = [
    { value: 'all',   label: 'Siempre' },
    { value: 'today', label: 'Hoy' },
    { value: 'week',  label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
];

const History = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        // El historial está en watchHistory dentro del perfil del usuario
        api.get('/users/me')
            .then(res => {
                const history = res.data.watchHistory || [];
                // Ordenar del más reciente al más antiguo
                history.sort((a, b) => new Date(b.lastTimeWatched) - new Date(a.lastTimeWatched));
                setItems(history);
            })
            .catch(err => console.error('Error al cargar historial:', err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const now = new Date();
        return items.filter(item => {
            if (typeFilter !== 'all') {
                const itemType = item.contentType === 'TVShow' ? 'series' : 'movie';
                if (itemType !== typeFilter) return false;
            }
            if (dateRange !== 'all') {
                const diffDays = (now - new Date(item.lastTimeWatched)) / (1000 * 60 * 60 * 24);
                if (dateRange === 'today' && diffDays > 1)  return false;
                if (dateRange === 'week'  && diffDays > 7)  return false;
                if (dateRange === 'month' && diffDays > 30) return false;
            }
            return true;
        });
    }, [items, typeFilter, dateRange]);

    const formatDate = (iso) => new Date(iso).toLocaleDateString('es-PE', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            Cargando historial...
        </div>
    );

    return (
        <div style={{ padding: '40px 5%', minHeight: '100vh', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                    Mi <span style={{ color: 'var(--accent)' }}>historial</span>
                </h2>
                {filtered.length > 0 && (
                    <span style={{ fontSize: '14px', color: '#666' }}>{filtered.length} registros</span>
                )}
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[['all', 'Todo'], ['movie', 'Películas'], ['series', 'Series']].map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setTypeFilter(val)}
                            style={{
                                padding: '7px 16px',
                                borderRadius: '20px',
                                border: `1px solid ${typeFilter === val ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                                background: typeFilter === val ? 'var(--accent)' : 'transparent',
                                color: typeFilter === val ? '#fff' : '#888',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <select
                    className="filter-select"
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                >
                    {DATE_RANGES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                </select>
            </div>

            {/* Lista */}
            {filtered.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '80px 0', color: '#555' }}>
                    <span style={{ fontSize: '48px' }}>📭</span>
                    <p style={{ fontSize: '15px', margin: 0 }}>No hay registros para los filtros seleccionados.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filtered.map((entry, idx) => {
                        const type = entry.contentType === 'TVShow' ? 'tvshow' : 'movie';
                        return (
                            <div
                                key={entry._id || idx}
                                onClick={() => navigate(`/item/${type}/${entry.contentId}`)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '12px 14px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer', transition: 'background 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            >
                                {/* Ícono de tipo */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                                    background: type === 'movie' ? 'rgba(88,166,255,0.18)' : 'rgba(16,185,129,0.2)',
                                    color: type === 'movie' ? '#58a6ff' : '#10b981',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em'
                                }}>
                                    {type === 'movie' ? 'PEL' : 'SER'}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {entry.contentId}
                                    </p>
                                    {/* Barra de progreso */}
                                    <div style={{ height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${Math.min(entry.percentWatched, 100)}%`, background: 'var(--accent)' }} />
                                    </div>
                                </div>

                                {/* Meta */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                                    <span style={{ fontSize: '11px', color: '#555' }}>{formatDate(entry.lastTimeWatched)}</span>
                                    <span style={{
                                        fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 500,
                                        background: type === 'movie' ? 'rgba(124,58,237,0.15)' : 'rgba(16,185,129,0.15)',
                                        color: type === 'movie' ? '#a78bfa' : '#6ee7b7'
                                    }}>
                                        {type === 'movie' ? 'Película' : 'Serie'} · {entry.percentWatched}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default History;