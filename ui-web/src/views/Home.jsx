import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/catalog/movies')
            .then(r => setMovies(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="py-40 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 text-sm font-medium">Fetching catalog...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-12 space-y-12 animate-in fade-in duration-500 px-4">
            <div className="flex items-end justify-between border-b border-[#30363d] pb-6">
                <div>
                    <h2 className="text-3xl font-bold">Recommended for you</h2>
                    <p className="text-gray-500 text-sm mt-1">Based on community trends</p>
                </div>
                <span className="text-[#58a6ff] text-sm font-bold cursor-pointer hover:underline">View All</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {movies.map(m => (
                    <div key={m._id} className="group space-y-3 cursor-pointer">
                        <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-[#161b22] border border-[#30363d] transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[#58a6ff]/50 shadow-2xl">
                            <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <div className="px-1">
                            <h3 className="text-sm font-bold truncate text-gray-200 group-hover:text-white transition-colors">{m.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[10px] text-yellow-500 font-bold">★ {m.voteAverage}</span>
                                <span className="text-[10px] text-gray-500 font-medium truncate">| {m.genres?.[0]}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;