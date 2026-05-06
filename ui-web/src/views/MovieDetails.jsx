import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MovieDetails = () => {
    const { type, id } = useParams();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);

    // Sincronizado con ReviewSchema: usamos 'text' en lugar de 'comment'
    const [newReview, setNewReview] = useState({ rating: 5, text: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [activeVideo, setActiveVideo] = useState('movie');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Traemos el contenido y las reseñas reales
                // CORRECCIÓN: La ruta correcta es /api/reviews/movie/:id
                const [itemRes, reviewsRes] = await Promise.all([
                    api.get(`/catalog/${type === 'movie' ? 'movies' : 'tvshows'}/${id}`),
                    api.get(`/reviews/movie/${id}`).catch(() => ({ data: [] }))
                ]);
                setItem(itemRes.data);
                setReviews(reviewsRes.data);

                // 2. Verificar si está en watchlist
                if (user) {
                    const me = await api.get('/users/me').catch(() => null);
                    if (me?.data?.watchlist) {
                        const found = me.data.watchlist.some(w => (w.item?._id || w.item || w) === id);
                        setInWatchlist(found);
                    }
                }
            } catch (error) {
                console.error("Error al cargar detalles:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, type, user]);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
        if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
        return url;
    };

    const trailerEmbedUrl = item ? getEmbedUrl(item.trailerUrl) : null;

    useEffect(() => {
        if (item && !trailerEmbedUrl) setActiveVideo('movie');
    }, [item, trailerEmbedUrl]);

    const toggleWatchlist = async () => {
        try {
            await api.post('/users/watchlist', { itemId: id, itemType: type });
            setInWatchlist(!inWatchlist);
        } catch (error) {
            console.error("Error Watchlist:", error);
            alert("No se pudo actualizar la lista.");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.text.trim()) return;

        try {
            if (editingReviewId) {
                await api.put(`/reviews/${editingReviewId}`, {
                    rating: newReview.rating,
                    text: newReview.text
                });
                setEditingReviewId(null);
            } else {
                // CAMPOS EXACTOS DEL BACKEND: movieId, contentType, text, rating
                await api.post('/reviews', {
                    movieId: id,
                    contentType: type,
                    text: newReview.text,
                    rating: newReview.rating
                });
            }

            // CORRECCIÓN: Recargamos usando la ruta /movie/:id
            const res = await api.get(`/reviews/movie/${id}`);
            setReviews(res.data);
            setNewReview({ rating: 5, text: '' });
        } catch (error) {
            console.error("Error Reseña:", error.response?.data);
            alert("Error al procesar la reseña: " + (error.response?.data?.message || "Verifica los campos"));
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("¿Seguro que quieres borrar tu opinión?")) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (error) {
            alert("Error al eliminar la reseña.");
        }
    };

    const handleEditReview = (rev) => {
        setEditingReviewId(rev._id);
        setNewReview({ rating: rev.rating, text: rev.text });
        window.scrollTo({ top: document.querySelector('.add-review-card').offsetTop - 100, behavior: 'smooth' });
    };

    if (loading) return <div className="loading-screen">Sincronizando Arcast...</div>;
    if (!item) return <div className="loading-screen">Contenido no encontrado</div>;

    const tmdbId = item.tmdbId || item.id || id;
    const movieEmbedUrl = type === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
        : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=1&episode=1`;

    return (
        <div className="detail-page">
            <div className="detail-backdrop" style={{ backgroundImage: `url(${item.backdropUrl || item.posterUrl})` }}>
                <div className="detail-mask"></div>
            </div>

            <div className="detail-container">
                <div className="detail-header">
                    <div className="detail-poster">
                        <img src={item.posterUrl} alt={item.title || item.name} />
                    </div>

                    <div className="detail-main-info">
                        <div className="badge-row">
                            <span className="type-badge">{type === 'movie' ? 'Película' : 'Serie'}</span>
                            <span className="year-badge">{item.releaseDate?.split('-')[0]}</span>
                        </div>
                        <h1 className="detail-title">{item.title || item.name}</h1>

                        <div className="stats-row">
                            <div className="score-circle">
                                <span className="score-val">{item.voteAverage?.toFixed(1) || '0'}</span>
                                <span className="score-label">Rating</span>
                            </div>
                            <div className="meta-info">
                                <p><strong>Géneros:</strong> {item.genres?.join(', ') || 'General'}</p>
                                <p><strong>Duración:</strong> {item.runtime ? `${item.runtime} min` : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="synopsis">
                            <h3>Sinopsis</h3>
                            <p>{item.overview || "No hay una descripción disponible para este título."}</p>
                        </div>

                        <div className="action-buttons">
                            <button className={`btn-secondary-outline ${inWatchlist ? 'active' : ''}`} onClick={toggleWatchlist}>
                                {inWatchlist ? '✓ EN MI LISTA' : '+ AÑADIR A MI LISTA'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="player-section">
                    <div className="player-tabs">
                        <button className={activeVideo === 'movie' ? 'active' : ''} onClick={() => setActiveVideo('movie')}>
                            Ver {type === 'movie' ? 'Película' : 'Contenido'}
                        </button>
                        {trailerEmbedUrl && (
                            <button className={activeVideo === 'trailer' ? 'active' : ''} onClick={() => setActiveVideo('trailer')}>
                                Ver Trailer
                            </button>
                        )}
                    </div>

                    <div className="player-glass-container">
                        <iframe
                            src={activeVideo === 'trailer' ? trailerEmbedUrl : movieEmbedUrl}
                            title="Reproductor"
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                <div className="reviews-section">
                    <h2 className="section-title">Comunidad <span>({reviews.length})</span></h2>

                    <div className="reviews-layout">
                        <div className="add-review-card">
                            <h3>{editingReviewId ? 'Editando tu opinión' : 'Deja tu calificación'}</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="star-rating-container">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={`star ${star <= (hoverRating || newReview.rating) ? 'active' : ''}`}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                        >★</span>
                                    ))}
                                </div>

                                <textarea
                                    className="modern-textarea"
                                    placeholder="¿Qué te pareció?"
                                    value={newReview.text}
                                    onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                                    required
                                />
                                <div className="form-actions">
                                    <button type="submit" className="submit-review-btn">
                                        {editingReviewId ? 'Actualizar' : 'Publicar'}
                                    </button>
                                    {editingReviewId && (
                                        <button
                                            type="button"
                                            className="cancel-edit-btn"
                                            onClick={() => { setEditingReviewId(null); setNewReview({ rating: 5, text: '' }); }}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="reviews-list">
                            {reviews.length > 0 ? (
                                reviews.map(rev => {
                                    const isOwner = user && (rev.username === user.username || rev.userId === user._id || rev.userId === user.id);

                                    return (
                                        <div key={rev._id} className="review-card-premium">
                                            <div className="review-user">
                                                <div className="user-avatar-mini">{rev.username?.charAt(0) || 'U'}</div>
                                                <div className="user-info-mini">
                                                    <h4>{rev.username}</h4>
                                                    <span>{new Date(rev.date || rev.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                {isOwner && (
                                                    <div className="review-actions">
                                                        <button onClick={() => handleEditReview(rev)}>✏️</button>
                                                        <button onClick={() => handleDeleteReview(rev._id)}>🗑️</button>
                                                    </div>
                                                )}

                                                <div className="user-rating-badge">★ {rev.rating}</div>
                                            </div>
                                            <p className="review-text">"{rev.text}"</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-reviews">
                                    <p>Nadie ha comentado aún. ¡Sé el primero!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;