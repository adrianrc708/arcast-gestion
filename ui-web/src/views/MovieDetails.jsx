import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ text: '', rating: 5 });
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // 1. Obtener detalles de la película (Backend: catalog.api.js)
                const movieRes = await api.get(`/catalog/movies/${id}`);
                setMovie(movieRes.data);

                // 2. Obtener reseñas de la película (Backend: reviews.controller.js)
                const reviewsRes = await api.get(`/reviews/movie/${id}`);
                setReviews(reviewsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        try {
            const res = await api.post('/reviews', {
                movieId: id,
                text: newReview.text,
                rating: newReview.rating,
                contentType: 'movie'
            });
            // Añadir la nueva reseña a la lista actual
            setReviews([res.data, ...reviews]);
            setNewReview({ text: '', rating: 5 });
        } catch (err) {
            setSubmitError(err.message || 'Error al publicar la reseña');
        }
    };

    if (loading) return <div className="py-40 text-center">Cargando detalles...</div>;
    if (!movie) return <div className="py-40 text-center">No se encontró el contenido.</div>;

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-500">
            <button
                onClick={() => navigate('/')}
                className="text-[#58a6ff] hover:underline text-sm font-semibold flex items-center gap-2"
            >
                ← Volver al catálogo
            </button>

            {/* Cabecera de la película */}
            <div className="flex flex-col md:flex-row gap-8 bg-[#161b22] p-6 rounded-2xl border border-[#30363d]">
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-48 rounded-xl shadow-lg object-cover"
                />
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
                    <div className="flex gap-4 text-sm text-gray-400 font-medium">
                        <span>★ {movie.voteAverage}</span>
                        <span>{movie.releaseDate}</span>
                        <span>{movie.genres?.join(', ')}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                </div>
            </div>

            {/* Sección de Reseñas (Conecta con tu backend de reviews) */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold border-b border-[#30363d] pb-4">Comunidad y Reseñas</h2>

                {/* Formulario para crear reseña */}
                <form onSubmit={handleReviewSubmit} className="bg-[#161b22] p-6 rounded-xl border border-[#30363d] space-y-4">
                    <h3 className="text-sm font-bold text-[#58a6ff]">Escribe tu opinión</h3>
                    {submitError && <p className="text-red-400 text-xs">{submitError}</p>}

                    <textarea
                        required
                        value={newReview.text}
                        onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm text-white outline-none focus:border-[#58a6ff]"
                        rows="3"
                        placeholder="¿Qué te pareció?"
                    ></textarea>

                    <div className="flex justify-between items-center">
                        <select
                            value={newReview.rating}
                            onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
                            className="bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-sm text-white outline-none"
                        >
                            {[5,4,3,2,1].map(num => (
                                <option key={num} value={num}>{num} Estrellas</option>
                            ))}
                        </select>
                        <button type="submit" className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors">
                            Publicar Reseña
                        </button>
                    </div>
                </form>

                {/* Lista de reseñas */}
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">Sé el primero en opinar.</p>
                    ) : (
                        reviews.map(rev => (
                            <div key={rev._id} className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-[#e6edf3] text-sm">{rev.username}</span>
                                    <span className="text-yellow-500 text-xs">★ {rev.rating}/5</span>
                                </div>
                                <p className="text-gray-400 text-sm">{rev.text}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;