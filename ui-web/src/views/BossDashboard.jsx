import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ACTION_DICTIONARY = {
    'USER_ROLE_MUTATION': 'Cambio de Roles de Usuario',
    'CONTENT_WATCHED': 'Visualización de Películas/Series',
    'PROFILE_UPDATE': 'Actualización de Perfil',
    'REVIEW_CREATED': 'Publicación de Reseñas',
    'REVIEW_UPDATED': 'Edición de Reseñas',
    'WATCHLIST_TOGGLE': 'Modificación de Mi Lista',
    'CATALOG_IMPORT': 'Importación Individual al Catálogo',
    'CATALOG_BULK_IMPORT': 'Importación Masiva de Catálogo',
    'USER_LOGIN': 'Inicios de Sesión'
};

const BossDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [actionSummary, setActionSummary] = useState([]);
    const [trafficData, setTrafficData] = useState([]);
    const [playbackData, setPlaybackData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metricType, setMetricType] = useState('activeUsers');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, usersRes, activityRes, trafficRes, playbackRes] = await Promise.all([
                    api.get('/users/stats'),
                    api.get('/users'),
                    api.get('/users/activity'),
                    api.get('/statistics/traffic?days=7').catch(() => ({ data: [] })),
                    api.get('/statistics/playback?days=7').catch(() => ({ data: [] }))
                ]);

                setStats(statsRes.data || null);
                setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                setTrafficData(Array.isArray(trafficRes.data) ? trafficRes.data : []);
                setPlaybackData(Array.isArray(playbackRes.data) ? playbackRes.data : []);

                const rawDaily = activityRes.data?.daily || [];
                const rawSummary = activityRes.data?.summary || [];

                const filledData = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);

                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;

                    const foundDay = rawDaily.find(item => item.date === dateStr);
                    filledData.push(foundDay || { date: dateStr, activeUsers: 0 });
                }

                setDailyData(filledData);
                setActionSummary(rawSummary);
            } catch (err) {
                console.error("Error cargando datos del Boss:", err);
                const errMsg = err.response?.data?.message || err.message || "Error al conectar";
                setError(typeof errMsg === 'string' ? errMsg : "Fallo de conexión");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="py-20 text-center text-purple-400 font-bold animate-pulse">Sincronizando con el núcleo...</div>;

    // PRE-PROCESAMIENTO DE SCM: Combinamos el diccionario estático con la actividad del backend
    const fullActionSummary = Object.keys(ACTION_DICTIONARY).map(actionKey => {
        const serverData = actionSummary.find(item => item.action === actionKey);
        return {
            action: actionKey,
            total: serverData ? serverData.total : 0,
            userCount: serverData ? serverData.userCount : 0
        };
    }).sort((a, b) => b.total - a.total); // Ordenamos de mayor a menor interacción

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-10 animate-in fade-in">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter border-b border-[#30363d]/50 pb-4">
                Centro de Mando (Boss)
            </h2>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm font-bold flex items-center gap-3">
                    <span>⚠️</span>
                    <p>Fallo de comunicación con el servidor: {error}</p>
                </div>
            )}

            {/* 1. MÉTRICAS CLAVE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Usuarios Registrados', val: stats?.metrics?.totalUsers, color: 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]' },
                    { label: 'Películas en Catálogo', val: stats?.metrics?.totalMovies, color: 'text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]' },
                    { label: 'Reseñas de la Comunidad', val: stats?.metrics?.totalReviews, color: 'text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]' }
                ].map((s, i) => (
                    <div key={i} className="bg-transparent backdrop-blur-sm p-8 rounded-2xl border border-white/5 flex flex-col items-center shadow-2xl transition-all hover:border-purple-500/30 hover:bg-purple-900/5">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{s.label}</span>
                        <span className={`text-6xl font-black mt-4 ${s.color}`}>{s.val || 0}</span>
                    </div>
                ))}
            </div>

            <div className="bg-transparent backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 mb-6 gap-4">
                    <div className="border-l-[4px] border-purple-500 pl-4 rounded-l-sm">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Análisis de Comportamiento y Retención</h3>
                        <p className="text-xs text-purple-400/60 mt-1">Datos de los últimos 7 días</p>
                    </div>

                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                        <button
                            onClick={() => setMetricType('activeUsers')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${metricType === 'activeUsers' ? 'bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-gray-500 hover:text-purple-400'}`}
                        >
                            Audiencia Activa
                        </button>
                        <button
                            onClick={() => setMetricType('actions')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${metricType === 'actions' ? 'bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-gray-500 hover:text-purple-400'}`}
                        >
                            Tipos de Interacción
                        </button>
                    </div>
                </div>

                <div className="h-64 w-full text-xs pt-4">
                    {/*BARRAS DE AUDIENCIA */}
                    {metricType === 'activeUsers' && (
                        <div className="flex items-end justify-between h-full w-full gap-2 sm:gap-4 relative px-2">
                            {dailyData.length === 0 ? (
                                <div className="w-full text-center text-gray-500 text-sm h-full flex items-center justify-center">Cargando audiencia...</div>
                            ) : dailyData.map((data, index) => {
                                const validDaily = dailyData.map(d => d.activeUsers || 0);
                                const maxVal = Math.max(...validDaily) || 1;
                                const currentActive = data.activeUsers || 0;
                                const heightPercentage = currentActive === 0 ? 0 : (currentActive / maxVal) * 100;
                                const dateParts = (data.date || '').split('-');
                                const shortDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : (data.date || '');

                                return (
                                    <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative cursor-pointer">
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-[#1a1a2e] text-purple-300 text-[10px] sm:text-xs font-bold py-1 px-2 rounded-md shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-opacity whitespace-nowrap z-10 pointer-events-none border border-purple-500/30">
                                            {currentActive} Usuarios
                                        </div>
                                        <div
                                            className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ${currentActive === 0 ? 'bg-white/5' : 'bg-gradient-to-t from-purple-900/40 to-purple-500/80 group-hover:to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                                }`}
                                            style={{ height: `${heightPercentage}%`, minHeight: '6px' }}
                                        ></div>
                                        <span className={`text-[10px] mt-3 truncate w-full text-center font-bold ${currentActive === 0 ? 'text-gray-600' : 'text-purple-400/70 group-hover:text-purple-300'}`}>
                                            {shortDate}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/*LISTA DE ACCIONES PERMANENTE (CORREGIDO) */}
                    {metricType === 'actions' && (
                        <div className="h-full overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {fullActionSummary.map((item, i) => {
                                const actionName = item.action;
                                const displayAction = ACTION_DICTIONARY[actionName] || actionName;
                                return (
                                    <div key={i} className="flex items-center justify-between p-4 bg-transparent rounded-xl border border-white/5 hover:border-purple-500/40 hover:bg-purple-900/10 transition-all shadow-sm group">
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">
                                                {displayAction}
                                            </h4>
                                            <div className="mt-1">
                                                <span className="text-[10px] text-purple-400/60 font-medium">
                                                    {item.userCount} {item.userCount === 1 ? 'Usuario único' : 'Usuarios únicos'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`block text-xl font-black transition-colors ${item.total === 0
                                                    ? 'text-gray-600 group-hover:text-gray-400'
                                                    : 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] group-hover:text-purple-300'
                                                }`}>
                                                {item.total}
                                            </span>
                                            <span className="text-purple-500/40 text-[9px] uppercase tracking-widest font-bold">Total</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SECCIÓN DE GRÁFICAS DE TRÁFICO Y REPRODUCCIÓN (NATIVO TAILWIND) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="bg-transparent backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col shadow-2xl">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2 border-l-[4px] border-purple-500 pl-4 rounded-l-sm">
                        Tráfico Horario (Peticiones)
                    </h3>
                    <div className="h-64 w-full pt-4">
                        <div className="flex items-end justify-between h-full w-full gap-1 relative px-1 border-b border-white/10 pb-4">
                            {trafficData.length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0d1117]/80 backdrop-blur-sm rounded-xl border border-white/5 mb-4">
                                    <span className="text-3xl mb-2 opacity-80">📡</span>
                                    <span className="text-[#38bdf8] font-bold text-sm">No hay tráfico reciente</span>
                                    <span className="text-gray-500 text-xs mt-1">Explora la plataforma para generar actividad</span>
                                </div>
                            )}
                            {(trafficData.length > 0 ? trafficData : Array.from({ length: 12 }).map((_, i) => ({ fecha: `00-00 ${String(i + 8).padStart(2, '0')}:00`, valor: 0 }))).map((data, index) => {
                                const maxVal = Math.max(...(trafficData.length > 0 ? trafficData : [{ valor: 1 }]).map(d => d.valor || 0)) || 1;
                                const heightPct = trafficData.length > 0 ? ((data.valor || 0) / maxVal) * 100 : 0;
                                const label = data.fecha ? String(data.fecha).substring(5, 13) : '';
                                return (
                                    <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative cursor-pointer">
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-[#1a1a2e] text-[#38bdf8] text-[10px] font-bold py-1 px-2 rounded-md shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-opacity whitespace-nowrap z-10 pointer-events-none border border-[#38bdf8]/30">
                                            {data.valor} req
                                        </div>
                                        <div
                                            className={`w-full max-w-[20px] rounded-t-md transition-all duration-500 ${trafficData.length === 0 ? 'bg-white/5' : 'bg-gradient-to-t from-[#0ea5e9]/20 to-[#38bdf8] group-hover:to-[#7dd3fc] shadow-[0_0_10px_rgba(56,189,248,0.2)]'}`}
                                            style={{ height: `${heightPct}%`, minHeight: '4px' }}
                                        ></div>
                                        <span className={`text-[9px] mt-3 truncate w-full text-center ${trafficData.length === 0 ? 'text-gray-700' : 'text-gray-500 group-hover:text-[#38bdf8]'}`}>
                                            {label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-transparent backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col shadow-2xl">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2 border-l-[4px] border-purple-500 pl-4 rounded-l-sm">
                        Reproducción Promedio (Minutos)
                    </h3>
                    <div className="h-64 w-full pt-4">
                        <div className="flex items-end justify-between h-full w-full gap-2 relative px-2 border-b border-white/10 pb-4">
                            {playbackData.length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0d1117]/80 backdrop-blur-sm rounded-xl border border-white/5 mb-4">
                                    <span className="text-3xl mb-2 opacity-80">▶️</span>
                                    <span className="text-[#a855f7] font-bold text-sm">No hay reproducciones recientes</span>
                                    <span className="text-gray-500 text-xs mt-1">Mira una película por más de 1 min para generar datos</span>
                                </div>
                            )}
                            {(playbackData.length > 0 ? playbackData : Array.from({ length: 7 }).map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); return { fecha: `${d.getFullYear()}-${m}-${day}`, valor: 0 }; })).map((data, index) => {
                                const maxVal = Math.max(...(playbackData.length > 0 ? playbackData : [{ valor: 1 }]).map(d => d.valor || 0)) || 1;
                                const heightPct = playbackData.length > 0 ? ((data.valor || 0) / maxVal) * 100 : 0;
                                const label = data.fecha ? String(data.fecha).substring(5) : '';
                                return (
                                    <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative cursor-pointer">
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-[#1a1a2e] text-[#a855f7] text-[10px] font-bold py-1 px-2 rounded-md shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-opacity whitespace-nowrap z-10 pointer-events-none border border-[#a855f7]/30">
                                            {data.valor} min
                                        </div>
                                        <div
                                            className={`w-full max-w-[30px] rounded-t-md transition-all duration-500 ${playbackData.length === 0 ? 'bg-white/5' : 'bg-gradient-to-t from-[#7e22ce]/20 to-[#a855f7] group-hover:to-[#c084fc] shadow-[0_0_10px_rgba(168,85,247,0.2)]'}`}
                                            style={{ height: `${heightPct}%`, minHeight: '4px' }}
                                        ></div>
                                        <span className={`text-[10px] mt-3 truncate w-full text-center font-bold ${playbackData.length === 0 ? 'text-gray-700' : 'text-gray-500 group-hover:text-[#a855f7]'}`}>
                                            {label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 Y 4. RAKINGS Y AUDITORÍA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="bg-transparent backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col h-full shadow-2xl">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2 border-l-[4px] border-purple-500 pl-4 rounded-l-sm">
                        <span className="text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">★</span> Top 5 Contenido Mejor Valorado
                    </h3>

                    <div className="space-y-3 flex-1">
                        {!stats?.rankings || stats.rankings.length === 0 ? (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl p-8">
                                <p className="text-purple-400/50 text-sm font-medium text-center">No hay suficientes datos calificados.</p>
                            </div>
                        ) : (
                            stats.rankings.map((movie, i) => {
                                const rating = typeof movie.voteAverage === 'number' ? movie.voteAverage.toFixed(1) : (movie.voteAverage || 0);
                                return (
                                    <div key={movie._id || i} className="flex items-center justify-between p-4 bg-transparent rounded-xl border border-white/5 hover:border-purple-500/40 hover:bg-purple-900/10 transition-all">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xl font-black text-purple-500/40">#{i + 1}</span>
                                            <span className="font-bold text-sm text-gray-200">{movie.title || movie.name || 'Desconocido'}</span>
                                        </div>
                                        <span className="text-yellow-500 font-bold text-sm drop-shadow-[0_0_5px_rgba(234,179,8,0.3)]">★ {rating}</span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                <div className="bg-transparent backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col h-full shadow-2xl">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6 border-l-[4px] border-purple-500 pl-4 rounded-l-sm">
                        Últimos Usuarios Registrados
                    </h3>

                    <div className="overflow-hidden rounded-xl border border-white/5 flex-1">
                        {users.length === 0 ? (
                            <div className="h-full flex items-center justify-center bg-black/20 p-8">
                                <p className="text-purple-400/50 text-sm font-medium text-center">No se encontraron usuarios.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm h-full">
                                <thead className="bg-black/40 text-purple-400/60 uppercase text-[10px] font-bold border-b border-white/5">
                                    <tr>
                                        <th className="px-4 py-3">Username</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Rol</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-transparent">
                                    {users.slice(-6).reverse().map((u, i) => (
                                        <tr key={u._id || i} className="hover:bg-purple-900/10 transition-colors">
                                            <td className="px-4 py-3 text-white font-medium">{u.username || 'Sin nombre'}</td>
                                            <td className="px-4 py-3 text-gray-400 text-xs">{u.email || 'Sin correo'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase shadow-sm ${u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    u.role === 'boss' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                    {u.role || 'user'}
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