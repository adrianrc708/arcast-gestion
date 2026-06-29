import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';


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
    const [resumePrompt, setResumePrompt] = useState(null);

    // --- 🌟 ESTADOS AÑADIDOS PARA SERIES (RF12) ---
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);

    // Ref para medir el tiempo de visualización
    const viewStartTime = useRef(null);

    // --- Sistema de progreso de visualización (reanudar reproducción) ---
    const [resumeTime, setResumeTime] = useState(0);
    const [progressLoading, setProgressLoading] = useState(false);
    const lastSavedAtRef = useRef(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemRes, reviewsRes] = await Promise.all([
                    api.get(`/catalog/${type === 'movie' ? 'movies' : 'tvshows'}/${id}`),
                    api.get(`/reviews/movie/${id}`).catch(() => ({ data: [] }))
                ]);
                setItem(itemRes.data);
                setReviews(reviewsRes.data);

                // 🌟 CORRECCIÓN 1: Leer 'seasons' de la BD en lugar de 'numberOfSeasons'
                if (type === 'tvshow' && itemRes.data) {
                    const numSeasons = itemRes.data.seasons || itemRes.data.numberOfSeasons || 1;
                    setSeasons(Array.from({ length: numSeasons }, (_, i) => i + 1));
                }

                if (user) {
                    const me = await api.get('/users/me').catch(() => null);
                    if (me?.data?.watchlist) {
                        const found = me.data.watchlist.some(w => (w.item?._id || w.item || w) === id);
                        setInWatchlist(found);
                    }
                    const history = me?.data?.watchHistory || [];
                    const entry = history.find(h => h.contentId === id);
                    if (entry && entry.currentTime > 10) {
                        setResumePrompt({ currentTime: entry.currentTime || 0, percent: entry.percentWatched });
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

    // --- 🌟 EFECTO AÑADIDO PARA TRAER CAPÍTULOS AL CAMBIAR TEMPORADA ---
    useEffect(() => {
        if (type === 'tvshow' && item) {
            // 🌟 CORRECCIÓN 2: Usar la ruta anidada correcta de Marcelo
            api.get(`/catalog/tvshows/${id}/episodes?season=${selectedSeason}`)
                .then(res => {
                    setEpisodes(res.data || []);
                    if (res.data && res.data.length > 0) {
                        setCurrentEpisode(res.data[0]);
                    } else {
                        setCurrentEpisode(null);
                    }
                })
                .catch(err => console.error("Error al cargar episodios:", err));
        }
    }, [id, type, item, selectedSeason]);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
        if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
        return url;
    };

    const trailerEmbedUrl = item ? getEmbedUrl(item.trailerUrl) : null;

    useEffect(() => {
        if (!item) return;
        if (resumePrompt) {
            setActiveVideo('alt');
            return;
        }
        if (!trailerEmbedUrl) {
            setActiveVideo(type === 'tvshow' ? 'episode' : 'movie');
        }
    }, [item, trailerEmbedUrl, type]);

    // Determina el contentId a usar contra el sistema de progreso de
    // visualización (/api/stream/progress) según la pestaña/video activo.
    // 'movie' y 'alt' son la misma película (solo cambia la fuente), por lo
    // que comparten el mismo progreso. 'episode' usa el _id del episodio.
    const getProgressContentId = () => {
        if ((activeVideo === 'local' || activeVideo === 'alt') && item) {
            return item._id || id;
        }
        if (activeVideo === 'episode' && currentEpisode) {
            return currentEpisode._id;
        }
        return null;
    };

    // --- Integración con el sistema de progreso: recuperar la posición guardada ---
    useEffect(() => {
        const contentId = getProgressContentId();

        if (!user || !contentId) {
            setResumeTime(0);
            setProgressLoading(false);
            return;
        }

        let isActive = true;
        setProgressLoading(true);

        api.get(`/stream/progress/${contentId}`)
            .then((res) => {
                if (!isActive) return;
                const saved = res?.data?.data?.progress;
                // Solo ofrecemos reanudar si quedó contenido pendiente por ver (<95%)
                if (saved && saved.duration > 0 && saved.currentTime < saved.duration * 0.95) {
                    setResumeTime(saved.currentTime);
                } else {
                    setResumeTime(0);
                }
            })
            .catch(() => {
                // 404 = sin progreso guardado todavía, o error silencioso de red
                if (isActive) setResumeTime(0);
            })
            .finally(() => {
                if (isActive) setProgressLoading(false);
            });

        return () => { isActive = false; };
    }, [user, activeVideo, item, currentEpisode, id]);


    useEffect(() => {
        // Inicia el contador de tiempo cuando el usuario empieza a ver el contenido
        if (user && item && (activeVideo === 'movie' || activeVideo === 'alt' || activeVideo === 'episode')) {
            viewStartTime.current = Date.now();

            // 1. Restauramos tu lógica original con el timer de 5 segundos de gracia
            const registerView = async () => {
                try {
                    await api.post('/users/progress', {
                        contentId: id,
                        percentWatched: 10 // Simulación de progreso inicial
                    });
                } catch (error) {
                    console.error("Error silencioso al registrar progreso:", error);
                }
            };

            const timer = setTimeout(() => {
                registerView();
            }, 5000);

            // La función de limpieza se ejecutará cuando el usuario navegue fuera de la página
            return () => {
                clearTimeout(timer); // Limpiamos el timer si cambia de página rápido
                if (viewStartTime.current) {
                    const endTime = Date.now();
                    const durationSeconds = (endTime - viewStartTime.current) / 1000;

                    // Solo registramos si el usuario vio más de 60 segundos para no contar clics accidentales
                    if (durationSeconds > 60) {
                        const durationMinutes = Math.round(durationSeconds / 60);

                        api.post('/statistics/playback', {
                            contentId: id,
                            contentType: type === 'movie' ? 'Movie' : 'TVShow',
                            durationMinutes: durationMinutes
                        }).then(() => {
                            console.log(`Métrica registrada: ${durationMinutes} minutos en ${item.title || item.name}`);
                        }).catch(err => {
                            console.error("Error silencioso al registrar métrica de tiempo:", err);
                        });
                    }
                }
            };
        }
    }, [user, item, activeVideo, id, type]);


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
                    contentType: type, // Ojo: Verifica que tu backend acepte 'tvshow', o cámbialo a 'TVShow' si te da error
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

    // 🌟 ACTUALIZADO: Para que VidSrc reaccione al cambio de episodios (usando .episode)
    const movieEmbedUrl = type === 'movie'
        ? `https://vidsrc.net/embed/movie?tmdb=${tmdbId}`
        : `https://vidsrc.net/embed/tv?tmdb=${tmdbId}&season=${selectedSeason}&episode=${currentEpisode?.episode || 1}`;

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

                {/* Calcula la URL de streaming local basada en el tmdbId o _id */}
                {(() => {
                    const streamToken = localStorage.getItem('arcast_token') || '';
                    const localMovieUrl = type === 'movie'
                        ? `/api/stream/movie/${item.tmdbId || id}?token=${streamToken}`
                        : null; // Para series lo maneja Gabriel en RF12

                    // 🌟 CORRECCIÓN 3: Leemos el enlace desde localPath y quitamos el estricto .endsWith('.mp4')
                    const archiveEpisodeUrl = type === 'tvshow' && currentEpisode ? currentEpisode.localPath : null;

                    const handleVideoProgress = async (currentTime, duration) => {
                        if (!user) return;
                        const percent = Math.round((currentTime / duration) * 100);
                        // Guardamos progreso cada 10% para no saturar el backend
                        if (percent % 10 === 0) {
                            try {
                                await api.post('/users/progress', {
                                    contentId: id,
                                    percentWatched: percent,
                                    currentTime: Math.floor(currentTime)
                                });
                            } catch (e) {
                                // Error silencioso — el progreso no es crítico
                            }
                        }

                        // --- Sistema de progreso de visualización (para reanudar reproducción) ---
                        // Guardamos como máximo una vez cada 8 segundos reales para no saturar el backend.
                        const progressContentId = getProgressContentId();
                        const now = Date.now();
                        if (progressContentId && duration && (now - lastSavedAtRef.current > 8000)) {
                            lastSavedAtRef.current = now;
                            try {
                                await api.post('/stream/progress', {
                                    contentId: progressContentId,
                                    currentTime: Math.floor(currentTime),
                                    duration: Math.floor(duration)
                                });
                            } catch (e) {
                                // Error silencioso — el progreso no es crítico para la reproducción
                            }
                        }
                    };

                    return (
                        <div className="player-section">
                            {resumePrompt && activeVideo === 'alt' &&  (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '10px', padding: '12px 18px', marginBottom: '12px', gap: '12px' }}>
                                <span style={{ color: '#e0e0e0', fontSize: '14px' }}>
                                    ▶ Viste el <strong style={{ color: 'var(--accent)' }}>{resumePrompt.percent}%</strong> — ¿continuar desde ahí?
                                </span>
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    <button className="hero-btn" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => { setActiveVideo('alt'); setResumePrompt(null); }}>Continuar</button>
                                    <button style={{ padding: '6px 14px', fontSize: '13px', background: 'transparent', border: '1px solid #444', borderRadius: '6px', color: '#888', cursor: 'pointer' }} onClick={() => { setActiveVideo('alt'); setResumePrompt(null); }}>Desde el inicio</button>
                                </div>
                            </div>
                        )}
                        <div className="player-tabs">
                                {/* Pestaña Local (RF11) — solo si hay streaming local disponible */}
                                {localMovieUrl && (
                                    <button
                                        className={activeVideo === 'local' ? 'active' : ''}
                                        onClick={() => setActiveVideo('local')}
                                    >
                                        ▶ Ver en Arcast
                                    </button>
                                )}

                                <button
                                    className={activeVideo === 'movie' ? 'active' : ''}
                                    onClick={() => setActiveVideo('movie')}
                                >
                                    Ver {type === 'movie' ? 'Película' : 'Contenido'}
                                </button>

                                {/* 🌟 REPARADO: Pestaña Alt (Exclusiva para Películas con Internet Archive) */}
                                {type === 'movie' && item.watchLink && (
                                    <button
                                        className={activeVideo === 'alt' ? 'active' : ''}
                                        onClick={() => setActiveVideo('alt')}
                                    >
                                        Fuente Alternativa
                                    </button>
                                )}

                                {/* 🌟 REPARADO: Pestaña Episode (Exclusiva para Series con Internet Archive) */}
                                {type === 'tvshow' && archiveEpisodeUrl && (
                                    <button
                                        className={activeVideo === 'episode' ? 'active' : ''}
                                        onClick={() => setActiveVideo('episode')}
                                    >
                                        ▶ Reproducir Capítulo
                                    </button>
                                )}

                                {trailerEmbedUrl && (
                                    <button
                                        className={activeVideo === 'trailer' ? 'active' : ''}
                                        onClick={() => setActiveVideo('trailer')}
                                    >
                                        Ver Trailer
                                    </button>
                                )}
                            </div>

                            {/* Reproductor Local (RF11) */}
                            {activeVideo === 'local' && localMovieUrl ? (
                                <VideoPlayer
                                    src={localMovieUrl}
                                    title={item.title || item.name}
                                    onProgress={handleVideoProgress}
                                    startTime={resumeTime}
                                    progressLoading={progressLoading}
                                />
                            ) : activeVideo === 'alt' && type === 'movie' && item.watchLink ? (
                                <VideoPlayer
                                    src={item.watchLink}
                                    title={item.title || item.name}
                                    onProgress={handleVideoProgress}
                                    initialTime={resumePrompt?.currentTime}
                                />
                            ) : activeVideo === 'episode' && type === 'tvshow' && archiveEpisodeUrl ? (
                                <VideoPlayer
                                    src={archiveEpisodeUrl}
                                    title={`${item.name} - T${selectedSeason}E${currentEpisode?.episode || 1}`}
                                    onProgress={handleVideoProgress}
                                    startTime={resumeTime}
                                    progressLoading={progressLoading}
                                />
                            ) : (
                                <div className="player-glass-container">
                                    <iframe
                                        src={
                                            activeVideo === 'trailer' ? trailerEmbedUrl :
                                                activeVideo === 'alt' ? getEmbedUrl(item.watchLink) : // Ojo, si es alt y no es .mp4, cae aquí
                                                    movieEmbedUrl
                                        }
                                        title="Reproductor"
                                        frameBorder="0"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* --- 🌟 UI AÑADIDA: SELECTOR DE TEMPORADAS Y NAVEGACIÓN (RF12) --- */}
                {type === 'tvshow' && seasons.length > 0 && (
                    <div className="bg-[#0d1117]/60 border border-white/5 p-6 rounded-2xl shadow-xl mt-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Capítulos de la Serie</h3>
                            <select
                                className="bg-[#161b22] text-[#58a6ff] border border-[#58a6ff]/30 rounded-xl px-4 py-2 font-bold focus:outline-none cursor-pointer"
                                value={selectedSeason}
                                onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                            >
                                {seasons.map(s => (
                                    <option key={s} value={s}>Temporada {s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {episodes.map(ep => (
                                <div
                                    key={ep._id}
                                    onClick={() => {
                                        setCurrentEpisode(ep);
                                        // 🌟 CORRECCIÓN 4: Verificamos localPath para activar el video
                                        setActiveVideo(ep.localPath ? 'episode' : 'movie');
                                    }}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${currentEpisode?._id === ep._id
                                        ? 'bg-blue-900/20 border-blue-500/50 shadow-md shadow-blue-500/5'
                                        : 'bg-transparent border-white/5 hover:border-[#58a6ff]/30 hover:bg-white/5'
                                        }`}
                                >
                                    <div>
                                        <span className="text-xs text-[#58a6ff] font-bold tracking-wider uppercase">Episodio {ep.episode || ep.episodeNumber}</span>
                                        <h4 className="font-bold text-gray-200 mt-1 text-sm">{ep.title || `Capítulo ${ep.episode || ep.episodeNumber}`}</h4>
                                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{ep.overview || "Sin descripción disponible para este episodio."}</p>
                                    </div>
                                    {ep.runtime && <span className="text-[10px] text-gray-500 font-medium mt-3 self-end">⏱ {ep.runtime} min</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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