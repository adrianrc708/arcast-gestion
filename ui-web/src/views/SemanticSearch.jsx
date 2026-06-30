import React, { useState } from 'react';
import AIResultCard from '../components/AIResultCard';

const MOCK_RESULTS = [
    {
        _id: '1', title: 'Blade Runner 2049', mediaType: 'movie',
        posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
        releaseDate: '2017-10-04', voteAverage: 8.1,
        aiExplanation: 'Esta película encaja perfectamente con tu descripción. Presenta una estética ciberpunk visualmente deslumbrante y cuestiona la naturaleza del ser humano a través de la inteligencia artificial.'
    },
    {
        _id: '2', title: 'Interstellar', mediaType: 'movie',
        posterUrl: 'https://image.tmdb.org/t/p/w500/nBNZadXqJSdt05SHLqgT0HuC5Gm.jpg',
        releaseDate: '2014-11-05', voteAverage: 8.4,
        aiExplanation: 'Basado en tu búsqueda de "ciencia ficción profunda", esta obra explora la relatividad, el amor interdimensional y la supervivencia de la humanidad con una banda sonora épica.'
    }
];

const SemanticSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        setResults([]); // Limpiar resultados anteriores

        // Simulando el tiempo de respuesta del motor de IA
        setTimeout(() => {
            setResults(MOCK_RESULTS);
            setIsSearching(false);
        }, 1500);
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 animate-in fade-in duration-500">
            <div className="text-center mb-12">
                <div className="inline-block bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold px-4 py-1 rounded-full text-xs uppercase tracking-widest mb-4">
                    Motor Experimental
                </div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#58a6ff] mb-4">
                    Búsqueda Semántica
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    No uses nombres exactos. Describe la trama, el estado de ánimo, o la estética de lo que tienes ganas de ver y nuestra IA hará el resto.
                </p>
            </div>

            <form onSubmit={handleSearch} className="relative mb-16 max-w-3xl mx-auto">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: Una película del espacio donde queden varados y te haga llorar..."
                    className="w-full bg-[#161b22] border-2 border-purple-500/30 rounded-2xl px-6 py-5 text-white text-lg focus:outline-none focus:border-purple-500 shadow-2xl shadow-purple-500/10 transition-all pr-36"
                />
                <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-[#58a6ff] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isSearching ? 'Pensando...' : '✨ Buscar'}
                </button>
            </form>

            <div className="space-y-6">
                {isSearching && (
                    <div className="text-center py-20 animate-pulse">
                        <div className="text-6xl mb-4">🤖</div>
                        <p className="text-purple-400 font-bold text-lg">Analizando billones de parámetros...</p>
                    </div>
                )}

                {!isSearching && hasSearched && results.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {results.map(item => <AIResultCard key={item._id} item={item} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SemanticSearch;