import React, { useEffect, useState } from 'react';
import api from '../services/api';

const BossDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/users/boss/stats').then(r => setStats(r.data)).catch(console.error);
    }, []);

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                    { l: 'Usuarios Activos', v: stats?.metrics?.totalUsers, c: 'cyan' },
                    { l: 'Títulos en Catálogo', v: stats?.metrics?.totalMovies, c: 'purple' },
                    { l: 'Reseñas Totales', v: stats?.metrics?.totalReviews, c: 'green' }
                ].map(x => (
                    <div key={x.l} className={`bg-[#1e293b] p-8 rounded-3xl border-b-4 border-${x.c}-500 shadow-2xl`}>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{x.l}</p>
                        <p className="text-6xl font-black text-white mt-2">{x.v || 0}</p>
                    </div>
                ))}
            </div>
            <div className="bg-[#1e293b] p-10 rounded-[3rem] border border-gray-800 shadow-xl">
                <h3 className="text-xl font-black text-white mb-8 italic">Ranking de Valoración</h3>
                <div className="space-y-4">
                    {stats?.rankings?.map((r, i) => (
                        <div key={r._id} className="flex items-center justify-between p-5 bg-[#0f172a] rounded-2xl border border-gray-800 hover:border-cyan-500/30 transition-all">
                            <div className="flex items-center space-x-4">
                                <span className="text-3xl font-black text-gray-800">0{i+1}</span>
                                <span className="text-white font-bold">{r.title}</span>
                            </div>
                            <span className="text-cyan-500 font-black tracking-widest">{r.voteAverage} ★</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BossDashboard;