import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MovieDetails = () => {
    const { type, id } = useParams();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);

    // Estado para el nuevo sistema de estrellas interactivo
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [hoverRating, setHoverRating] = useState(0);

    const [loading, setLoading] = useState(true);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [activeVideo, setActiveVideo] = useState('trailer');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemRes, reviewsRes] = await Promise.all([
                    api.get(`/catalog/${type === 'movie' ? 'movies' : 'tvshows'}/${id}`),
                    api.get(`/reviews/${type}/${id}`).catch(() => ({ data: [] }))
                ]);
                setItem(itemRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error("Error al cargar detalles", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, type]);

    // Ocultar pestaña de tráiler si no existe
    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
        if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
        return url;
    };
    const trailerEmbedUrl = item ? getEmbedUrl(item.trailerUrl) : null;

    useEffect(() => {
        if (item && !trailerEmbedUrl) {
            setActiveVideo('movie'); // Salta directo a la película si no hay tráiler
        }
    }, [item, trailerEmbedUrl]);

    // UI OPTIMISTA: Las reseñas se agregan visualmente sin importar si el backend falla
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.comment.trim()) return;

        // Creamos una reseña falsa al instante para la interfaz
        const optimisticReview = {
            _id: Date.now().toString(),
            userId: { name: user?.name || 'Yo' },
            rating: newReview.rating,
            comment: newReview.comment,
            createdAt: new Date().toISOString()
        };

        setReviews([optimisticReview, ...reviews]);
        const payload = { ...newReview, itemId: id, itemType: type };
        setNewReview({ rating: 5, comment: '' });

        try {
            await api.post('/reviews', payload);
        } catch (error) {
            console.warn("Silenciando error de backend (Reseñas):", error);
        }
    };

    // UI OPTIMISTA: El botón se activa inmediatamente
    const toggleWatchlist = async () => {
        setInWatchlist(!inWatchlist);
        try {
            await api.post('/users/watchlist', { itemId: id, itemType: type });
        } catch (error) {
            console.warn("Silenciando error de backend (Watchlist):", error);
        }
    };

    if (loading) return <div className="loading-screen">Cargando experiencia...</div>;
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

                {/* REPRODUCTOR MEJORADO */}
                <div className="player-section">
                    <div className="player-tabs">
                        {trailerEmbedUrl && (
                            <button
                                className={activeVideo === 'trailer' ? 'active' : ''}
                                onClick={() => setActiveVideo('trailer')}
                            >
                                Ver Trailer
                            </button>
                        )}
                        <button
                            className={activeVideo === 'movie' ? 'active' : ''}
                            onClick={() => setActiveVideo('movie')}
                        >
                            Ver {type === 'movie' ? 'Película' : 'Capítulo 1'}
                        </button>
                    </div>

                    <div className="player-glass-container">
                        {activeVideo === 'trailer' ? (
                            <iframe src={trailerEmbedUrl} title="Trailer" frameBorder="0" allowFullScreen></iframe>
                        ) : (
                            <iframe src={movieEmbedUrl} title="Reproductor" frameBorder="0" allowFullScreen></iframe>
                        )}
                    </div>
                </div>

                {/* RESEÑAS CON NUEVO FORMULARIO */}
                <div className="reviews-section">
                    <h2 className="section-title">Comunidad <span>({reviews.length})</span></h2>

                    <div className="reviews-layout">
                        <div className="add-review-card">
                            <h3>Deja tu calificación</h3>
                            <form onSubmit={handleReviewSubmit}>

                                {/* NUEVAS ESTRELLAS INTERACTIVAS */}
                                <div className="star-rating-container">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={`star ${(hoverRating || newReview.rating) >= star ? 'active' : ''}`}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>

                                <textarea
                                    className="modern-textarea"
                                    placeholder="Escribe tu opinión sin spoilers..."
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                    required
                                />
                                <button type="submit" className="submit-review-btn">Publicar Opinión</button>
                            </form>
                        </div>

                        <div className="reviews-list">
                            {reviews.length > 0 ? (
                                reviews.map(rev => (
                                    <div key={rev._id} className="review-card-premium">
                                        <div className="review-user">
                                            <div className="user-avatar-mini">{rev.userId?.name?.charAt(0) || 'U'}</div>
                                            <div className="user-info-mini">
                                                <h4>{rev.userId?.name || 'Usuario Anónimo'}</h4>
                                                <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {/* Adaptado a 5 estrellas */}
                                            <div className="user-rating-badge">★ {rev.rating > 5 ? Math.round(rev.rating/2) : rev.rating}</div>
                                        </div>
                                        <p className="review-text">"{rev.comment}"</p>
                                    </div>
                                ))
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