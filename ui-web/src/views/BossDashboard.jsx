import React, { useState, useEffect } from 'react';
import api from '../services/api';

const BossDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtiene métricas y ranking
                const statsRes = await api.get('/users/stats');
                setStats(statsRes.data);

                // Obtiene lista completa de usuarios
                const usersRes = await api.get('/users');
                setUsers(usersRes.data);
            } catch (err) {
                console.error("Error cargando datos del Boss:", err);
                setError(err.response?.data?.message || "Error al conectar con la API de estadísticas. Revisa la consola.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="py-20 text-center text-[#58a6ff] font-bold animate-pulse">Analizando datos del sistema...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-10 animate-in fade-in">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter border-b border-[#30363d] pb-4">
                Centro de Mando (Boss)
            </h2>

            {/* AVISO DE ERROR SI EL BACKEND FALLA */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm font-bold flex items-center gap-3">
                    <span>⚠️</span>
                    <p>Fallo de comunicación con el servidor: {error}</p>
                </div>
            )}

            {/* 1. MÉTRICAS CLAVE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Usuarios Registrados', val: stats?.metrics?.totalUsers, color: 'text-blue-400' },
                    { label: 'Películas en Catálogo', val: stats?.metrics?.totalMovies, color: 'text-purple-400' },
                    { label: 'Reseñas de la Comunidad', val: stats?.metrics?.totalReviews, color: 'text-green-400' }
                ].map((s, i) => (
                    <div key={i} className="bg-[#161b22] p-8 rounded-2xl border border-[#30363d] flex flex-col items-center shadow-xl transition-all hover:border-[#58a6ff]/30">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{s.label}</span>
                        <span className={`text-6xl font-black mt-4 ${s.color}`}>{s.val || 0}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. TOP RATED MOVIES */}
                <div className="bg-[#161b22] p-6 rounded-2xl border border-[#30363d] flex flex-col h-full">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-yellow-500">★</span> Top 5 Contenido Mejor Valorado
                    </h3>

                    <div className="space-y-3 flex-1">
                        {!stats?.rankings || stats.rankings.length === 0 ? (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-[#30363d] rounded-xl p-8">
                                <p className="text-gray-500 text-sm font-medium text-center">No hay suficientes datos calificados para mostrar un ranking aún.</p>
                            </div>
                        ) : (
                            stats.rankings.map((movie, i) => (
                                <div key={movie._id} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-xl border border-[#30363d] hover:border-[#58a6ff]/50 transition-all">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xl font-black text-gray-700">#{i+1}</span>
                                        <span className="font-bold text-sm text-gray-200">{movie.title || movie.name}</span>
                                    </div>
                                    <span className="text-yellow-500 font-bold text-sm">★ {movie.voteAverage?.toFixed(1)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. AUDITORÍA RÁPIDA DE USUARIOS */}
                <div className="bg-[#161b22] p-6 rounded-2xl border border-[#30363d] flex flex-col h-full">
                    <h3 className="text-lg font-bold text-white mb-6">Últimos Usuarios Registrados</h3>

                    <div className="overflow-hidden rounded-xl border border-[#30363d] flex-1">
                        {users.length === 0 ? (
                            <div className="h-full flex items-center justify-center bg-[#0d1117] p-8">
                                <p className="text-gray-500 text-sm font-medium text-center">No se encontraron usuarios en la base de datos.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm h-full">
                                <thead className="bg-[#0d1117] text-gray-400 uppercase text-[10px] font-bold border-b border-[#30363d]">
                                <tr>
                                    <th className="px-4 py-3">Username</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Rol</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#30363d]">
                                {users.slice(-6).reverse().map(u => (
                                    <tr key={u._id} className="hover:bg-[#1f242c] transition-colors">
                                        <td className="px-4 py-3 text-white font-medium">{u.username}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                                        <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                    u.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                                                        u.role === 'boss' ? 'bg-purple-500/10 text-purple-400' :
                                                            'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                    {u.role}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BossDashboard;