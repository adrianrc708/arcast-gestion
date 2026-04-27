import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MovieDetails = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ text: '', rating: 5 });

    const [showTrailer, setShowTrailer] = useState(false);
    const [showMoviePlayer, setShowMoviePlayer] = useState(false);
    const [isAddingToList, setIsAddingToList] = useState(false);
    const [listMessage, setListMessage] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const endpoint = type === 'movie' ? `/catalog/movies/${id}` : `/catalog/tvshows/${id}`;
                const itemRes = await api.get(endpoint);
                setItem(itemRes.data);

                const revRes = await api.get(`/reviews/movie/${id}`);
                setReviews(revRes.data);
            } catch (err) {
                console.error("Error al cargar detalles:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id, type]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/reviews', {
                movieId: id,
                text: newReview.text,
                rating: newReview.rating,
                contentType: type
            });
            setReviews([res.data, ...reviews]);
            setNewReview({ text: '', rating: 5 });
        } catch (err) {
            alert(err.response?.data?.message || 'Error al publicar la reseña');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta reseña?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (err) {
            alert('Error al eliminar la reseña');
        }
    };

    const handleAddToList = async () => {
        if (!user) {
            setListMessage('Inicia sesión para guardar.');
            setTimeout(() => setListMessage(''), 3000);
            return;
        }

        setIsAddingToList(true);
        try {
            await api.post('/users/progress', {
                contentId: id,
                percentWatched: 0
            });
            setListMessage('¡Guardado en tu historial!');
        } catch (error) {
            console.error("Error al guardar:", error);
            setListMessage('Error al guardar.');
        } finally {
            setIsAddingToList(false);
            setTimeout(() => setListMessage(''), 3000);
        }
    };

    const getEmbedUrl = () => {
        if (!item) return '';
        if (item.watchLink && !item.watchLink.includes('themoviedb.org')) return item.watchLink;

        const idParaVidsrc = item.externalId || item.tmdbId;

        if (type === 'movie' && idParaVidsrc) {
            return `https://vidsrc.me/embed/movie?tmdb=${idParaVidsrc}`;
        }
        if (type === 'tv' && idParaVidsrc) {
            return `https://vidsrc.me/embed/tv?tmdb=${idParaVidsrc}`;
        }
        return '';
    };

    // --- SOLUCIÓN TRÁILER: Manejar fallos de YouTube ---
    const getTrailerUrl = () => {
        if (!item?.trailerKey) return null;

        // Si el admin pegó un ID de Vimeo (solo números, ej: 123456789)
        if (/^\d+$/.test(item.trailerKey)) {
            return `https://player.vimeo.com/video/${item.trailerKey}?autoplay=1`;
        }

        // Si es de YouTube, seguimos usando youtube-nocookie
        return `https://www.youtube-nocookie.com/embed/${item.trailerKey}?autoplay=1&rel=0&iv_load_policy=3&fs=1&mute=0`;
    };

    if (loading) return <div className="py-40 text-center text-[#58a6ff] font-medium animate-pulse">Cargando detalles...</div>;
    if (!item) return <div className="py-40 text-center text-red-400 font-bold">Contenido no encontrado.</div>;

    const isMovie = type === 'movie';
    const title = item.title || item.name;
    const date = item.releaseDate || item.firstAirDate;
    const embedUrl = getEmbedUrl();
    const isExternalWatchLink = item.watchLink && !item.watchLink.includes('themoviedb.org');
    const trailerUrl = getTrailerUrl();

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-12 animate-in fade-in duration-500">
            <button onClick={() => navigate(-1)} className="text-[#58a6ff] hover:text-white flex items-center gap-2 text-sm font-bold transition-colors">
                <span>←</span> Volver al Catálogo
            </button>

            <div className="flex flex-col lg:flex-row gap-10 bg-[#161b22] p-8 rounded-3xl border border-[#30363d] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 blur-3xl pointer-events-none" style={{ backgroundImage: `url(${item.posterUrl})`, backgroundSize: 'cover' }}></div>

                <div className="w-full lg:w-80 shrink-0 relative z-10 flex flex-col gap-4">
                    {showTrailer && trailerUrl ? (
                        <div className="w-full aspect-[2/3] lg:aspect-auto lg:h-[480px] bg-black rounded-2xl overflow-hidden shadow-xl border border-[#30363d] relative">
                            {/* HACK DE PRESENTACIÓN: Botón de escape directo a YT por si falla el iframe */}
                            <div className="absolute top-2 right-2 z-50">
                                <a
                                    href={`https://www.youtube.com/watch?v=${item.trailerKey}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="bg-black/60 hover:bg-red-600 text-white text-[10px] px-3 py-1.5 rounded flex items-center gap-2 transition-all border border-gray-600 hover:border-red-500"
                                >
                                    Ver directo en YouTube ↗
                                </a>
                            </div>

                            <iframe
                                width="100%" height="100%"
                                src={trailerUrl}
                                title="Tráiler"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <div className="relative group w-full aspect-[2/3] lg:aspect-auto lg:h-[480px] rounded-2xl overflow-hidden shadow-xl border border-[#30363d] bg-[#0d1117]">
                            <img
                                src={item.posterUrl || "https://via.placeholder.com/300x450?text=Sin+P%C3%B3ster"}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {item.trailerKey && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => setShowTrailer(true)}
                                        className="bg-red-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:scale-110 hover:bg-red-500 transition-all flex items-center justify-center"
                                        title="Ver Tráiler"
                                    >
                                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z"/></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {showTrailer && <button onClick={() => setShowTrailer(false)} className="text-xs text-gray-400 hover:text-white font-bold bg-[#161b22] py-2 rounded-lg border border-[#30363d]">Cerrar Reproductor</button>}
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-6 z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-[#58a6ff]/10 text-[#58a6ff] px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-[#58a6ff]/20">
                                {isMovie ? 'Película' : 'Serie'}
                            </span>
                            {date && <span className="text-gray-400 text-sm font-bold">{date.substring(0,4)}</span>}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{title}</h1>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] px-4 py-1.5 rounded-lg text-yellow-500 font-bold">
                            ★ {item.voteAverage ? item.voteAverage.toFixed(1) : 'S/N'}
                        </span>
                        {item.duration && <span className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] px-4 py-1.5 rounded-lg text-gray-300 font-medium">⏱ {item.duration} min</span>}
                        {!isMovie && item.seasons && <span className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] px-4 py-1.5 rounded-lg text-gray-300 font-medium">📺 {item.seasons} Temporadas</span>}
                    </div>

                    <p className="text-gray-300 leading-relaxed text-base border-l-2 border-[#58a6ff] pl-4">
                        {item.overview || 'No hay descripción disponible.'}
                    </p>

                    <div className="pt-6 flex flex-col sm:flex-row flex-wrap items-center gap-4 border-t border-[#30363d]/50">
                        {embedUrl ? (
                            <button
                                onClick={() => isExternalWatchLink ? window.open(embedUrl, '_blank') : setShowMoviePlayer(true)}
                                className="bg-[#238636] hover:bg-[#2ea043] text-white font-black px-8 py-4 rounded-xl shadow-[0_0_15px_rgba(35,134,54,0.4)] transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 w-full sm:w-auto"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z"/></svg>
                                {isExternalWatchLink ? 'VER EN ENLACE EXTERNO' : 'REPRODUCIR PELÍCULA'}
                            </button>
                        ) : (
                            <button disabled className="bg-[#21262d] text-gray-500 font-bold px-8 py-4 rounded-xl cursor-not-allowed border border-[#30363d] flex items-center justify-center gap-3 w-full sm:w-auto">
                                NO DISPONIBLE
                            </button>
                        )}

                        <div className="relative w-full sm:w-auto flex flex-col items-center">
                            <button
                                onClick={handleAddToList}
                                disabled={isAddingToList}
                                className="bg-[#21262d] hover:bg-[#30363d] text-white font-bold px-6 py-4 rounded-xl border border-[#30363d] transition-all w-full disabled:opacity-50"
                            >
                                {isAddingToList ? 'Guardando...' : '+ Mi Lista'}
                            </button>
                            {listMessage && (
                                <span className="absolute top-full mt-2 text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full whitespace-nowrap">
                                    {listMessage}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* REPRODUCTOR Vidsrc / Modal */}
            {showMoviePlayer && !isExternalWatchLink && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-5xl flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold text-lg">{title}</h3>
                        <button onClick={() => setShowMoviePlayer(false)} className="text-gray-400 hover:text-white font-bold text-xl px-4 py-2 bg-red-600 rounded-lg">Cerrar Video ✕</button>
                    </div>
                    <div className="w-full max-w-5xl aspect-video bg-[#0d1117] rounded-2xl overflow-hidden border border-[#30363d] shadow-2xl relative">
                        <div className="absolute top-2 right-2 bg-black/70 text-[10px] text-gray-400 px-2 py-1 rounded pointer-events-none z-10">Fuente Externa (Vidsrc)</div>
                        <iframe
                            width="100%" height="100%" src={embedUrl}
                            frameBorder="0" allowFullScreen
                            title={title}
                        ></iframe>
                    </div>
                </div>
            )}

            <div className="bg-[#0d1117] rounded-3xl border border-[#30363d] p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8 border-b border-[#30363d] pb-4">
                    <h2 className="text-2xl font-black text-white">Comunidad y Reseñas</h2>
                    <span className="bg-[#161b22] px-3 py-1 rounded-full text-xs font-bold text-gray-400 border border-[#30363d]">{reviews.length} Comentarios</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1">
                        <form onSubmit={handleReviewSubmit} className="bg-[#161b22] p-6 rounded-2xl border border-[#30363d] sticky top-24">
                            <h3 className="text-sm font-bold text-[#58a6ff] uppercase tracking-widest mb-4">Tu Opinión</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex gap-2">
                                        {[1,2,3,4,5].map(num => (
                                            <button
                                                key={num} type="button" onClick={() => setNewReview({...newReview, rating: num})}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${newReview.rating === num ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-[#0d1117] border-[#30363d] text-gray-500'}`}
                                            >{num}★</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <textarea required value={newReview.text} onChange={(e) => setNewReview({...newReview, text: e.target.value})} className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-sm text-white outline-none focus:border-[#58a6ff] resize-none" rows="4" placeholder="¿Qué te pareció?"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-[#f0f6fc] text-[#0d1117] font-black py-3 rounded-xl hover:bg-white transition-all">Publicar</button>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {reviews.length === 0 ? <p className="text-gray-500 italic">Sé el primero en comentar.</p> : (
                            reviews.map(rev => (
                                <div key={rev._id} className="bg-[#161b22] p-5 rounded-2xl border border-[#30363d]">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#58a6ff] flex items-center justify-center text-white font-black text-xs">{rev.username?.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{rev.username}</p>
                                                <div className="flex text-yellow-500 text-[10px]">{'★'.repeat(rev.rating)}</div>
                                            </div>
                                        </div>
                                        {(user?.role === 'admin' || user?.username === rev.username) && (
                                            <button onClick={() => handleDeleteReview(rev._id)} className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">Eliminar</button>
                                        )}
                                    </div>
                                    <p className="text-gray-300 text-sm pl-11">{rev.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;