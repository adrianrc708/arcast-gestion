import React from 'react';
import { useNavigate } from 'react-router-dom';

const AIResultCard = ({ item }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/item/${item.mediaType || 'movie'}/${item._id}`)}
            className="bg-[#161b22] border border-purple-500/30 rounded-2xl overflow-hidden hover:border-purple-500 transition-all cursor-pointer shadow-lg shadow-purple-500/5 group"
        >
            <div className="flex flex-col sm:flex-row h-full">
                <img
                    src={item.posterUrl || 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Sin+Imagen'}
                    alt={item.title || item.name}
                    className="w-full sm:w-36 h-56 object-cover group-hover:brightness-110 transition-all"
                />
                <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                        <div className="flex justify-between items-start mb-2 gap-4">
                            <h3 className="font-bold text-white text-lg leading-tight">{item.title || item.name}</h3>
                            <span className="text-xs font-mono bg-purple-500/20 text-purple-300 px-2 py-1 rounded whitespace-nowrap">
                                ★ {item.voteAverage?.toFixed(1) || 'N/A'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wider">
                            {(item.releaseDate || item.firstAirDate)?.split('-')[0]} • {item.mediaType === 'movie' ? 'Película' : 'Serie'}
                        </p>

                        <div className="bg-purple-900/20 p-3 rounded-xl border border-purple-500/20 relative">
                            <span className="absolute -top-3 left-3 text-lg">✨</span>
                            <p className="text-sm text-purple-200 italic pt-1 leading-relaxed line-clamp-3">
                                "{item.aiExplanation}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIResultCard;