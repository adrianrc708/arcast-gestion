import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('movies');
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.get(`/catalog/${type}`).then(res => setItems(res.data)).finally(() => setLoading(false));
    }, [type]);

    return (
        <div className="pb-20">
            {/* HERO SECTION */}
            <div className="hero-mini">
                <div className="max-w-2xl space-y-4">
                    <span className="text-[#38bdf8] font-black uppercase tracking-widest text-sm">Destacado</span>
                    <h1 className="text-6xl font-black leading-none">THE BATMAN</h1>
                    <p className="text-gray-400 text-lg">En su segundo año luchando contra el crimen, Batman explora la corrupción existente en la ciudad de Gotham.</p>
                    <button className="bg-[#38bdf8] text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition">VER AHORA</button>
                </div>
            </div>

            {/* FILTROS */}
            <div className="px-[5%] flex items-center gap-4 mb-8">
                <button onClick={() => setType('movies')} className={`px-6 py-2 rounded-full font-bold transition ${type === 'movies' ? 'bg-[#38bdf8] text-black' : 'bg-white/5'}`}>Películas</button>
                <button onClick={() => setType('tvshows')} className={`px-6 py-2 rounded-full font-bold transition ${type === 'tvshows' ? 'bg-[#38bdf8] text-black' : 'bg-white/5'}`}>Series</button>
            </div>

            {/* RIELES DE CONTENIDO */}
            <div className="row-container">
                <h2 className="text-2xl font-bold mb-4 border-l-4 border-[#38bdf8] pl-4">Novedades</h2>
                <div className="row-track">
                    {items.map(item => (
                        <div key={item._id} onClick={() => navigate(`/item/${type === 'movies' ? 'movie' : 'tvshow'}/${item._id}`)} className="movie-card group cursor-pointer">
                            <div className="aspect-[2/3] overflow-hidden">
                                <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3">
                                <h3 className="text-sm font-bold truncate text-gray-300 group-hover:text-[#38bdf8] transition">{item.title || item.name}</h3>
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500">
                                    <span>{item.releaseDate?.split('-')[0]}</span>
                                    <span className="text-yellow-500">★ {item.voteAverage?.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;