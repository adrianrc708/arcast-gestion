import React, { useState } from 'react';
import api from '../services/api';
import AIResultCard from '../components/AIResultCard';

// Normaliza el tipo que devuelve el backend ('tv') al que usan las rutas ('tvshow').
const normalizeType = (mediaType) => (mediaType === 'tv' || mediaType === 'tvshow' ? 'tvshow' : 'movie');

// Construye una explicación legible a partir de lo que la IA interpretó y del propio título.
const buildExplanation = (item, interpretation) => {
    const g = (interpretation.genres || []).find(
        (genre) => (item.genres || []).some((ig) => ig.toLowerCase().includes(genre.toLowerCase()))
    );
    if (g) return `Coincide con el género "${g}" que describiste.`;
    const kws = interpretation.keywords || [];
    if (kws.length) return `Relacionada con tu búsqueda de: ${kws.slice(0, 3).join(', ')}.`;
    if (item.voteAverage) return `Sugerida por la IA (valoración ${item.voteAverage.toFixed(1)}).`;
    return 'Sugerida por la IA según tu descripción.';
};

const Chip = ({ label, value }) => (
    <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs">
        <span className="text-gray-500 uppercase tracking-wider font-bold">{label}</span>
        <span className="text-[#e6edf3] font-semibold">{value}</span>
    </span>
);

const SemanticSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [interpretation, setInterpretation] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim() || isSearching) return;

        setIsSearching(true);
        setHasSearched(true);
        setError(null);
        setResults([]);
        setInterpretation(null);

        try {
            const res = await api.post('/search/semantic', { query });
            const data = res?.data?.data || {};
            const interp = data.interpretation || {};
            const raw = data.results || [];

            const mapped = raw.map((item) => ({
                ...item,
                mediaType: normalizeType(item.mediaType),
                aiExplanation: buildExplanation(item, interp),
            }));

            setInterpretation(interp);
            setResults(mapped);
        } catch (err) {
            setError(err.message || 'No se pudo completar la búsqueda. Intenta de nuevo.');
        } finally {
            setIsSearching(false);
        }
    };

    const interpChips = interpretation
        ? [
            (interpretation.keywords || []).length ? { label: 'Palabras', value: interpretation.keywords.join(', ') } : null,
            (interpretation.genres || []).length ? { label: 'Género', value: interpretation.genres.join(', ') } : null,
            (interpretation.country || []).length ? { label: 'País', value: interpretation.country.join(', ') } : null,
        ].filter(Boolean)
        : [];

    return (
        <div className="max-w-5xl mx-auto py-14 px-4">
            <div className="text-center mb-10">
                <span className="inline-block bg-[#58a6ff]/10 border border-[#58a6ff]/25 text-[#58a6ff] font-bold px-4 py-1 rounded-full text-xs uppercase tracking-[0.2em] mb-5">
                    Búsqueda con IA
                </span>
                <h1 className="text-4xl font-black text-white mb-4">Describe lo que quieres ver</h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
                    No hace falta el título exacto. Escribe la trama, el ambiente o el tipo de historia
                    y la IA interpretará tu intención para buscar en el catálogo.
                </p>
            </div>

            <form onSubmit={handleSearch} className="relative mb-10 max-w-3xl mx-auto">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: un drama peruano sobre familias en la sierra"
                    className="w-full bg-[#161b22] border border-white/10 rounded-2xl px-6 py-5 text-white text-lg focus:outline-none focus:border-[#58a6ff] transition-colors pr-36"
                />
                <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded-xl font-black hover:bg-[#7dc0ff] transition-colors disabled:opacity-50"
                >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {/* Estado de carga */}
            {isSearching && (
                <div className="flex flex-col items-center py-16 gap-4">
                    <div className="w-9 h-9 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 font-semibold">Interpretando tu descripción...</p>
                </div>
            )}

            {/* Error */}
            {!isSearching && error && (
                <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-5 py-4 text-center font-semibold">
                    {error}
                </div>
            )}

            {/* Resultados */}
            {!isSearching && !error && hasSearched && (
                <>
                    {interpChips.length > 0 && (
                        <div className="max-w-3xl mx-auto mb-8">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3 text-center">La IA entendió</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {interpChips.map((c, i) => <Chip key={i} label={c.label} value={c.value} />)}
                            </div>
                        </div>
                    )}

                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {results.map((item) => <AIResultCard key={`${item.mediaType}-${item._id}`} item={item} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-lg font-bold text-gray-300 mb-2">Sin coincidencias</p>
                            <p>No encontramos títulos en el catálogo que encajen con esa descripción. Prueba con otras palabras.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SemanticSearch;
