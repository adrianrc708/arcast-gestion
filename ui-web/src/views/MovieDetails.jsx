import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const MovieDetails = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ text: '', rating: 5 });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const endpoint = type === 'movie' ? `/catalog/movies/${id}` : `/catalog/tvshows/${id}`;
                const itemRes = await api.get(endpoint);
                setItem(itemRes.data);

                const revRes = await api.get(`/reviews/movie/${id}`);
                setReviews(revRes.data);
            } catch (err) {
                console.error(err);
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
            alert(err.message || 'Error al publicar');
        }
    };

    if (loading) return <div className="py-40 text-center text-gray-500">Cargando detalles...</div>;
    if (!item) return <div className="py-40 text-center text-red-400">Contenido no encontrado.</div>;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-12 animate-in fade-in duration-300">
            <button onClick={() => navigate(-1)} className="text-[#58a6ff] hover:underline text-sm font-semibold">← Volver</button>

            <div className="flex flex-col md:flex-row gap-8 bg-[#161b22] p-6 rounded-2xl border border-[#30363d]">
                <img src={item.posterUrl} alt={item.title || item.name} className="w-56 rounded-xl shadow-lg object-cover" />
                <div className="space-y-4 flex-1">
                    <h1 className="text-4xl font-bold text-white">{item.title || item.name}</h1>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <span className="bg-[#0d1117] border border-[#30363d] px-3 py-1 rounded-full text-yellow-500">★ {item.voteAverage?.toFixed(1)}</span>
                        <span className="bg-[#0d1117] border border-[#30363d] px-3 py-1 rounded-full">{item.releaseDate || item.firstAirDate}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm">{item.overview}</p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold border-b border-[#30363d] pb-4">Reseñas de la Comunidad</h2>

                <form onSubmit={handleReviewSubmit} className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] space-y-3">
                    <textarea
                        required value={newReview.text} onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm text-white outline-none focus:border-[#58a6ff] resize-none"
                        rows="3" placeholder="Escribe tu reseña aquí..."
                    ></textarea>
                    <div className="flex justify-between items-center">
                        <select value={newReview.rating} onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-sm text-white outline-none">
                            {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Estrellas</option>)}
                        </select>
                        <button type="submit" className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors">
                            Publicar
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    {reviews.length === 0 ? <p className="text-gray-500 text-sm italic">Sin reseñas aún.</p> :
                        reviews.map(rev => (
                            <div key={rev._id} className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-[#e6edf3] text-sm">{rev.username}</span>
                                    <span className="text-yellow-500 text-xs font-bold">★ {rev.rating}/5</span>
                                </div>
                                <p className="text-gray-400 text-sm">{rev.text}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;