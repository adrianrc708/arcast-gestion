import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('movies');

    // ESTADOS PARA FILTROS
    const [search, setSearch] = useState('');
    const [genre, setGenre] = useState('Todas');
    const [sort, setSort] = useState('newest');

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        // Enviamos los filtros como Query Params a la API
        api.get(`/catalog/${type}`, {
            params: { search, genre, sort }
        })
            .then(res => setItems(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [type, search, genre, sort]); // Se recarga cuando cambias cualquier filtro

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
            {/* CABECERA Y BUSCADOR */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#30363d] pb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter uppercase">Catálogo</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sincronizado con Arcast API</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* BARRA DE BÚSQUEDA */}
                    <input
                        type="text"
                        placeholder="Buscar título..."
                        className="bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#58a6ff] transition-all w-full sm:w-64"
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {/* FILTRO DE GÉNERO */}
                    <select
                        className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm font-bold outline-none cursor-pointer"
                        onChange={(e) => setGenre(e.target.value)}
                    >
                        <option value="Todas">Géneros</option>
                        <option value="Acción">Acción</option>
                        <option value="Aventura">Aventura</option>
                        <option value="Comedia">Comedia</option>
                    </select>

                    {/* ORDENAMIENTO */}
                    <select
                        className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm font-bold outline-none cursor-pointer"
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="newest">Recientes</option>
                        <option value="rating">Mejor Valoradas</option>
                    </select>

                    {/* SELECTOR TIPO (MOVIES/TV) */}
                    <div className="flex bg-[#161b22] rounded-lg p-1 border border-[#30363d]">
                        <button onClick={() => setType('movies')} className={`px-4 py-1.5 text-xs font-black uppercase rounded-md transition-all ${type === 'movies' ? 'bg-[#58a6ff] text-white' : 'text-gray-400'}`}>Películas</button>
                        <button onClick={() => setType('tvshows')} className={`px-4 py-1.5 text-xs font-black uppercase rounded-md transition-all ${type === 'tvshows' ? 'bg-[#58a6ff] text-white' : 'text-gray-400'}`}>Series</button>
                    </div>
                </div>
            </div>

            {/* GRILLA DE CONTENIDO (Mismo código que ya tenías) */}
            {loading ? (
                <div className="py-20 text-center text-[#58a6ff] animate-pulse font-black uppercase tracking-widest text-xs">Sincronizando...</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {items.map(item => (
                        <div key={item._id} onClick={() => navigate(`/item/${type === 'movies' ? 'movie' : 'tvshow'}/${item._id}`)} className="group cursor-pointer">
                            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] transition-all group-hover:border-[#58a6ff] shadow-2xl relative">
                                <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-2 right-2 bg-black/90 text-yellow-400 text-[10px] font-black px-2 py-1 rounded border border-white/10">★ {item.voteAverage?.toFixed(1)}</div>
                            </div>
                            <h3 className="text-xs font-bold truncate mt-3 text-gray-300 group-hover:text-white uppercase tracking-tight">{item.title || item.name}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;