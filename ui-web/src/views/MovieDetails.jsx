import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MovieDetails = () => {
    const { type, id } = useParams();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);

    const [newReview, setReview] = useState({ rating: 5, text: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [activeVideo, setActiveVideo] = useState('movie');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemRes, reviewsRes] = await Promise.all([
                    api.get(`/catalog/${type === 'movie' ? 'movies' : 'tvshows'}/${id}`),
                    api.get(`/reviews/movie/${id}`).catch(() => ({ data: [] }))
                ]);
                setItem(itemRes.data);
                setReviews(reviewsRes.data);

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


    useEffect(() => {
        // Solo enviamos el registro si el usuario está autenticado y la pestaña activa es la película o fuente alternativa.
        if (user && item && (activeVideo === 'movie' || activeVideo === 'alt')) {
            const registerView = async () => {
                try {
                    // Aviso a la ruta updateProgress
                    await api.post('/users/progress', {
                        contentId: id,
                        percentWatched: 10 // Mandamos un progreso inicial simulado, CAMBIAR A VARIABLE DINAMICA CUANDO SE IMPLEMENTE SEGUIR VIENDO
                    });
                } catch (error) {
                    console.error("Error silencioso al registrar visualización:", error);
                }
            };

            // Le damos 5 segundos de gracia para no contar clics accidentales
            const timer = setTimeout(() => {
                registerView();
            }, 5000);

            return () => clearTimeout(timer); // Limpiamos el timer si cambia de página rápido
        }
    }, [user, item, activeVideo, id]);

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
                await api.post('/reviews', {
                    movieId: id,
                    contentType: type,
                    text: newReview.text,
                    rating: newReview.rating
                });
            }

            const res = await api.get(`/reviews/movie/${id}`);
            setReviews(res.data);
            setReview({ rating: 5, text: '' });
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
        setReview({ rating: rev.rating, text: rev.text });
        window.scrollTo({ top: document.querySelector('.add-review-card').offsetTop - 100, behavior: 'smooth' });
    };

    if (loading) return <div className="loading-screen">Sincronizando Arcast...</div>;
    if (!item) return <div className="loading-screen">Contenido no encontrado</div>;

    const tmdbId = item.tmdbId || item.id || id;
    const movieEmbedUrl = type === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
        : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=1&episode=1`;

    // Lógica para fondo por defecto si no hay imágenes
    const bgImage = item.backdropUrl || item.posterUrl || 'https://via.placeholder.com/1920x1080/111111/111111';

    return (
        <div className="detail-page">
            <div className="detail-backdrop" style={{ backgroundImage: `url(${bgImage})` }}>
                <div className="detail-mask"></div>
            </div>

            <div className="detail-container">
                <div className="detail-header">
                    <div className="detail-poster">
                        {/* Renderizado condicional del póster */}
                        <img
                            src={item.posterUrl || 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=P%C3%B3ster+no+disponible'}
                            alt={item.title || item.name}
                        />
                    </div>

                    <div className="detail-main-info">
                        <div className="badge-row">
                            <span className="type-badge">{type === 'movie' ? 'Película' : 'Serie'}</span>
                            {/* Renderizado seguro del año */}
                            <span className="year-badge">{item.releaseDate ? item.releaseDate.split('-')[0] : 'Año desconocido'}</span>
                        </div>
                        <h1 className="detail-title">{item.title || item.name}</h1>

                        <div className="stats-row">
                            {/* Solo muestra el círculo de Rating si existe un puntaje mayor a 0 */}
                            {item.voteAverage ? (
                                <div className="score-circle">
                                    <span className="score-val">{item.voteAverage.toFixed(1)}</span>
                                    <span className="score-label">Rating</span>
                                </div>
                            ) : null}

                            <div className="meta-info">
                                <p><strong>Géneros:</strong> {item.genres?.length > 0 ? item.genres.join(', ') : 'No clasificado'}</p>

                                {/* Solo muestra la duración si existe */}
                                {item.runtime ? (
                                    <p><strong>Duración:</strong> {item.runtime} min</p>
                                ) : null}
                            </div>
                        </div>

                        <div className="synopsis">
                            <h3>Sinopsis</h3>
                            {/* Mensaje por defecto si no hay descripción */}
                            <p>{item.overview || "La sinopsis de esta obra aún no está disponible en nuestro archivo."}</p>
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
                        {/* RESCATADO DE TU COMPAÑERO */}
                        {item.watchLink && (
                            <button className={activeVideo === 'alt' ? 'active' : ''} onClick={() => setActiveVideo('alt')}>
                                Fuente Alternativa
                            </button>
                        )}
                        {trailerEmbedUrl && (
                            <button className={activeVideo === 'trailer' ? 'active' : ''} onClick={() => setActiveVideo('trailer')}>
                                Ver Trailer
                            </button>
                        )}
                    </div>

                    <div className="player-glass-container">
                        <iframe
                            src={
                                activeVideo === 'trailer' ? trailerEmbedUrl :
                                    activeVideo === 'alt' ? getEmbedUrl(item.watchLink) :
                                        movieEmbedUrl
                            }
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
                                            onClick={() => setReview({ ...newReview, rating: star })}
                                        >★</span>
                                    ))}
                                </div>

                                <textarea
                                    className="modern-textarea"
                                    placeholder="¿Qué te pareció?"
                                    value={newReview.text}
                                    onChange={(e) => setReview({ ...newReview, text: e.target.value })}
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
                                            onClick={() => { setEditingReviewId(null); setReview({ rating: 5, text: '' }); }}
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