import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('movies'); // 'movies' o 'tvshows'
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.get(`/catalog/${type}`)
            .then(res => setItems(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [type]);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#30363d] pb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-bold">Catálogo</h2>
                    <p className="text-gray-500 text-sm mt-1">Explora el contenido de tu backend</p>
                </div>
                <div className="flex bg-[#161b22] rounded-lg p-1 border border-[#30363d]">
                    <button onClick={() => setType('movies')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${type === 'movies' ? 'bg-[#58a6ff] text-white' : 'text-gray-400 hover:text-white'}`}>Películas</button>
                    <button onClick={() => setType('tvshows')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${type === 'tvshows' ? 'bg-[#58a6ff] text-white' : 'text-gray-400 hover:text-white'}`}>Series</button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-500 font-medium">Cargando catálogo...</div>
            ) : items.length === 0 ? (
                <div className="py-20 text-center text-gray-500">No hay contenido. Usa el panel de Admin para importar de TMDB.</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {items.map(item => (
                        <div key={item._id} onClick={() => navigate(`/item/${type === 'movies' ? 'movie' : 'tvshow'}/${item._id}`)} className="group space-y-3 cursor-pointer">
                            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#58a6ff] shadow-lg relative">
                                <img src={item.posterUrl} alt={item.title || item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm border border-white/10">★ {item.voteAverage?.toFixed(1)}</div>
                            </div>
                            <div className="px-1">
                                <h3 className="text-sm font-bold truncate text-gray-200 group-hover:text-white">{item.title || item.name}</h3>
                                <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{item.genres?.join(', ')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;