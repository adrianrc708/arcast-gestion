import React, { useState, useEffect } from 'react';
import api from '../services/api';

const BossDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/users/stats').then(r => setStats(r.data)).catch(console.error);
    }, []);

    if(!stats) return <div className="py-20 text-center text-gray-500">Calculando métricas...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-10 animate-in fade-in">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter border-b border-[#30363d] pb-4">Centro de Mando</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Usuarios Activos', val: stats.metrics?.totalUsers, color: 'text-blue-400' },
                    { label: 'Catálogo', val: stats.metrics?.totalMovies, color: 'text-purple-400' },
                    { label: 'Reseñas Totales', val: stats.metrics?.totalReviews, color: 'text-green-400' }
                ].map((s, i) => (
                    <div key={i} className="bg-[#161b22] p-6 rounded-2xl border border-[#30363d] flex flex-col items-center justify-center text-center">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{s.label}</span>
                        <span className={`text-5xl font-black mt-3 ${s.color}`}>{s.val || 0}</span>
                    </div>
                ))}
            </div>

            <div className="bg-[#161b22] p-8 rounded-2xl border border-[#30363d]">
                <h3 className="text-xl font-bold text-white mb-6">Top 5 Películas Mejor Valoradas</h3>
                <div className="space-y-3">
                    {stats.rankings?.map((r, i) => (
                        <div key={r._id} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
                            <div className="flex items-center space-x-4">
                                <span className="text-2xl font-black text-[#58a6ff]">#{i+1}</span>
                                <span className="font-bold text-sm">{r.title}</span>
                            </div>
                            <span className="text-yellow-500 font-bold text-sm">★ {r.voteAverage?.toFixed(1)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BossDashboard;