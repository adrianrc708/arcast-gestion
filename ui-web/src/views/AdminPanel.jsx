import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('import');
    const [msg, setMsg] = useState({ text: '', type: '' });

    const showSuccess = (text) => setMsg({ text, type: 'success' });
    const showError = (text) => setMsg({ text, type: 'error' });
    const clearMsg = () => setMsg({ text: '', type: '' });

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-8 animate-in fade-in">
            <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6 px-4">Centro de Control</h2>
                {[
                    { id: 'import', label: '1. Importar (TMDB)' },
                    { id: 'movies', label: '2. Gestión de Películas' },
                    { id: 'tvshows', label: '3. Gestión de Series' },
                    { id: 'reviews', label: '4. Moderar Reseñas' },
                    { id: 'users', label: '5. Gestión de Usuarios' },
                    { id: 'system', label: '6. Sistema Global' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); clearMsg(); }}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                            activeTab === tab.id
                                ? 'bg-[#58a6ff] text-[#0d1117] shadow-lg shadow-[#58a6ff]/20'
                                : 'text-gray-400 hover:bg-[#161b22] hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </aside>

            <main className="flex-1 space-y-6">
                {msg.text && (
                    <div className={`p-4 rounded-xl border text-sm font-bold flex justify-between items-center ${
                        msg.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
                    }`}>
                        <span>{msg.type === 'success' ? '✅' : '❌'} {msg.text}</span>
                        <button onClick={clearMsg} className="opacity-50 hover:opacity-100">✕</button>
                    </div>
                )}

                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 min-h-[500px]">
                    {activeTab === 'import' && <TabImport onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'movies' && <TabMovies onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'tvshows' && <TabTVShows onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'reviews' && <TabReviews onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'users' && <TabUsers onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'system' && <TabSystem onSuccess={showSuccess} onError={showError} />}
                </div>
            </main>
        </div>
    );
};

// ==========================================
// PESTAÑA 1: IMPORTACIÓN
// ==========================================
const TabImport = ({ onSuccess, onError }) => {
    const [id, setId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImport = async (type) => {
        if (!id) return onError('Ingresa un ID válido de TMDB.');
        setLoading(true);
        try {
            await api.post(`/catalog/import/${type}`, { externalId: id, provider: 'tmdb' });
            onSuccess(`Contenido importado exitosamente como ${type === 'movie' ? 'Película' : 'Serie'}.`);
            setId('');
        } catch (e) {
            onError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-[#30363d] pb-4">Importar desde TMDB</h3>
            <p className="text-sm text-gray-400">Extrae información automáticamente usando el ID de la base de datos de TMDB.</p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                <input
                    value={id} onChange={e => setId(e.target.value)}
                    placeholder="ID de TMDB (ej: 550 para Fight Club)"
                    className="flex-1 bg-[#0d1117] border border-[#30363d] text-white p-3 rounded-lg outline-none focus:border-[#58a6ff] font-mono text-sm"
                />
                <button
                    disabled={loading} onClick={() => handleImport('movie')}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold px-6 py-3 rounded-lg transition-all text-sm disabled:opacity-50"
                >
                    Traer Película
                </button>
                <button
                    disabled={loading} onClick={() => handleImport('tv')}
                    className="bg-[#8957e5] hover:bg-[#9e6cff] text-white font-bold px-6 py-3 rounded-lg transition-all text-sm disabled:opacity-50"
                >
                    Traer Serie
                </button>
            </div>
        </div>
    );
};

// ==========================================
// PESTAÑA 2: GESTIÓN DE PELÍCULAS
// ==========================================
const TabMovies = ({ onSuccess, onError }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', overview: '', releaseDate: '', externalId: '' });

    const fetchMovies = () => {
        setLoading(true);
        api.get('/catalog/movies')
            .then(res => setMovies(res.data))
            .catch(e => onError("Error al cargar películas."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchMovies(); }, []);

    const handleDelete = async (id, title) => {
        if(!window.confirm(`¿Eliminar la película "${title}"?`)) return;
        try {
            await api.delete(`/catalog/movies/${id}`);
            onSuccess('Película eliminada correctamente.');
            fetchMovies();
        } catch (e) { onError(e.message); }
    };

    const handleEditClick = (movie) => {
        setFormData({
            title: movie.title || '',
            overview: movie.overview || '',
            releaseDate: movie.releaseDate || '',
            externalId: movie.externalId || ''
        });
        setEditingId(movie._id);
        setShowForm(true);
    };

    const handleNewClick = () => {
        setFormData({ title: '', overview: '', releaseDate: '', externalId: '' });
        setEditingId(null);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/catalog/movies/${editingId}`, formData);
                onSuccess('Película actualizada correctamente.');
            } else {
                await api.post('/catalog/movies', formData);
                onSuccess('Película creada correctamente.');
            }
            setShowForm(false);
            fetchMovies();
        } catch (error) {
            onError(error.response?.data?.message || 'Error al guardar la película.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
                <h3 className="text-xl font-bold text-white">Catálogo de Películas</h3>
                <button onClick={handleNewClick} className="bg-[#f0f6fc] text-[#0d1117] font-bold px-4 py-2 rounded-lg text-sm hover:bg-white transition-all">+ Nueva Manual</button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] space-y-4 mb-6">
                    <h4 className="text-[#58a6ff] font-bold text-sm uppercase tracking-widest">{editingId ? 'Editar Película' : 'Crear Nueva Película'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input required type="text" placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="Fecha Estreno (ej. 2023-10-25)" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="ID Externo (opcional)" value={formData.externalId} onChange={e => setFormData({...formData, externalId: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                    </div>
                    <textarea placeholder="Sinopsis..." value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})} className="w-full bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm resize-none" rows="3"></textarea>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white font-bold">Cancelar</button>
                        <button type="submit" className="bg-[#238636] text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#2ea043]">Guardar</button>
                    </div>
                </form>
            )}

            {loading ? <p className="text-gray-500">Cargando...</p> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs uppercase bg-[#0d1117] text-gray-300">
                        <tr>
                            <th className="px-4 py-3">Título</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {movies.map(m => (
                            <tr key={m._id} className="border-b border-[#30363d] hover:bg-[#0d1117]/50">
                                <td className="px-4 py-3 font-bold text-white">{m.title}</td>
                                <td className="px-4 py-3">{m.releaseDate || 'N/A'}</td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    <button onClick={() => handleEditClick(m)} className="text-blue-400 hover:underline text-xs font-bold">Editar</button>
                                    <button onClick={() => handleDelete(m._id, m.title)} className="text-red-400 hover:underline text-xs font-bold">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ==========================================
// PESTAÑA 3: GESTIÓN DE SERIES
// ==========================================
const TabTVShows = ({ onSuccess, onError }) => {
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', overview: '', firstAirDate: '', seasons: 1 });

    const fetchShows = () => {
        setLoading(true);
        api.get('/catalog/tvshows')
            .then(res => setShows(res.data))
            .catch(e => onError("Error al cargar series."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchShows(); }, []);

    const handleDelete = async (id, name) => {
        if(!window.confirm(`¿Eliminar la serie "${name}"?`)) return;
        try {
            await api.delete(`/catalog/tvshows/${id}`);
            onSuccess('Serie eliminada correctamente.');
            fetchShows();
        } catch (e) { onError(e.message); }
    };

    const handleEditClick = (show) => {
        setFormData({
            name: show.name || '',
            overview: show.overview || '',
            firstAirDate: show.firstAirDate || '',
            seasons: show.seasons || 1
        });
        setEditingId(show._id);
        setShowForm(true);
    };

    const handleNewClick = () => {
        setFormData({ name: '', overview: '', firstAirDate: '', seasons: 1 });
        setEditingId(null);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/catalog/tvshows/${editingId}`, formData);
                onSuccess('Serie actualizada correctamente.');
            } else {
                await api.post('/catalog/tvshows', formData);
                onSuccess('Serie creada correctamente.');
            }
            setShowForm(false);
            fetchShows();
        } catch (error) {
            onError(error.response?.data?.message || 'Error al guardar la serie.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
                <h3 className="text-xl font-bold text-white">Catálogo de Series</h3>
                <button onClick={handleNewClick} className="bg-[#f0f6fc] text-[#0d1117] font-bold px-4 py-2 rounded-lg text-sm hover:bg-white transition-all">+ Nueva Manual</button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] space-y-4 mb-6">
                    <h4 className="text-[#58a6ff] font-bold text-sm uppercase tracking-widest">{editingId ? 'Editar Serie' : 'Crear Nueva Serie'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input required type="text" placeholder="Nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="Fecha Estreno (ej. 2023)" value={formData.firstAirDate} onChange={e => setFormData({...formData, firstAirDate: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="number" min="1" placeholder="Temporadas" value={formData.seasons} onChange={e => setFormData({...formData, seasons: Number(e.target.value)})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                    </div>
                    <textarea placeholder="Sinopsis..." value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})} className="w-full bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm resize-none" rows="3"></textarea>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white font-bold">Cancelar</button>
                        <button type="submit" className="bg-[#238636] text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#2ea043]">Guardar</button>
                    </div>
                </form>
            )}

            {loading ? <p className="text-gray-500">Cargando...</p> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs uppercase bg-[#0d1117] text-gray-300">
                        <tr>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Temporadas</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {shows.map(s => (
                            <tr key={s._id} className="border-b border-[#30363d] hover:bg-[#0d1117]/50">
                                <td className="px-4 py-3 font-bold text-white">{s.name}</td>
                                <td className="px-4 py-3">{s.seasons || 'N/A'}</td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    <button onClick={() => handleEditClick(s)} className="text-blue-400 hover:underline text-xs font-bold">Editar</button>
                                    <button onClick={() => handleDelete(s._id, s.name)} className="text-red-400 hover:underline text-xs font-bold">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ==========================================
// PESTAÑA 4: MODERACIÓN DE RESEÑAS
// ==========================================
const TabReviews = ({ onSuccess, onError }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = () => {
        setLoading(true);
        // Ahora usamos la ruta GET /api/reviews que acabas de agregar al backend
        api.get('/reviews')
            .then(res => setReviews(res.data))
            .catch(err => {
                console.error(err);
                onError("Error al cargar las reseñas globales.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleDeleteReview = async (id) => {
        if(!window.confirm(`¿Eliminar esta reseña permanentemente?`)) return;
        try {
            await api.delete(`/reviews/${id}`);
            onSuccess('Reseña eliminada correctamente.');
            fetchReviews(); // Recargar la lista
        } catch(e) {
            onError("No se pudo eliminar la reseña.");
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-[#30363d] pb-4">Moderación Global de Reseñas</h3>

            {loading ? (
                <p className="text-gray-500">Cargando reseñas...</p>
            ) : reviews.length === 0 ? (
                <p className="text-gray-500 italic">No hay reseñas publicadas en la plataforma.</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map(r => (
                        <div key={r._id} className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-white text-sm">{r.username}</span>
                                    <span className="text-yellow-500 text-xs font-bold bg-yellow-500/10 px-2 py-0.5 rounded">★ {r.rating}/5</span>
                                </div>
                                <p className="text-sm text-gray-300">{r.text}</p>
                                <p className="text-xs text-gray-600 mt-2 font-mono">Reseña ID: {r._id.substring(0, 8)}... | Item ID: {r.movieId?.substring(0,8)}...</p>
                            </div>
                            <button
                                onClick={() => handleDeleteReview(r._id)}
                                className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-500/20 transition-all shrink-0"
                            >
                                Eliminar
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==========================================
// PESTAÑA 5: GESTIÓN DE USUARIOS
// ==========================================
const TabUsers = ({ onSuccess, onError }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ahora usamos la ruta GET /api/users que acabas de agregar al backend
        api.get('/users')
            .then(res => setUsers(res.data))
            .catch(e => {
                console.error(e);
                onError("Error al cargar la lista de usuarios.");
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-[#30363d] pb-4">Usuarios Registrados</h3>

            {loading ? <p className="text-gray-500">Cargando usuarios...</p> : users.length === 0 ? (
                <p className="text-gray-500">No se encontraron usuarios.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs uppercase bg-[#0d1117] text-gray-300">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Usuario</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Rol</th>
                            <th className="px-4 py-3 rounded-tr-lg">Fecha Registro</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(u => (
                            <tr key={u._id} className="border-b border-[#30363d] hover:bg-[#0d1117]/50">
                                <td className="px-4 py-3 font-bold text-white">{u.username}</td>
                                <td className="px-4 py-3">{u.email}</td>
                                <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                            u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                u.role === 'boss' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {u.role}
                                        </span>
                                </td>
                                <td className="px-4 py-3 text-xs">
                                    {/* Fallback si no tienes createdAt en tu modelo User */}
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ==========================================
// PESTAÑA 6: SISTEMA GLOBAL
// ==========================================
const TabSystem = ({ onSuccess, onError }) => {
    const [config, setConfig] = useState({ customCSS: '', maintenanceMode: false });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/system/config').then(res => {
            if(res.data) setConfig({ customCSS: res.data.customCSS || '', maintenanceMode: res.data.maintenanceMode || false });
        }).catch(() => {});
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put('/system/config', config);
            onSuccess('Configuración del sistema actualizada.');
        } catch (e) {
            onError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h3 className="text-xl font-bold text-white border-b border-[#30363d] pb-4">Configuración del Sistema</h3>

            <div className="space-y-6">
                <label className="flex items-center space-x-4 cursor-pointer bg-[#0d1117] p-5 rounded-xl border border-[#30363d] hover:border-[#58a6ff] transition-all">
                    <input
                        type="checkbox" checked={config.maintenanceMode}
                        onChange={e => setConfig({...config, maintenanceMode: e.target.checked})}
                        className="accent-[#58a6ff] w-5 h-5"
                    />
                    <div>
                        <span className="text-sm font-bold text-white block">Modo Mantenimiento</span>
                        <span className="text-xs text-gray-500">Si se activa, solo los administradores podrán acceder a la plataforma.</span>
                    </div>
                </label>

                <div className="space-y-2">
                    <span className="text-sm font-bold text-white block">Inyectar CSS Personalizado:</span>
                    <p className="text-xs text-gray-500">Este código se aplicará globalmente. Usa con precaución.</p>
                    <textarea
                        value={config.customCSS} onChange={e => setConfig({...config, customCSS: e.target.value})}
                        className="w-full bg-[#0d1117] border border-[#30363d] text-green-400 p-4 rounded-lg outline-none font-mono text-xs resize-y"
                        rows="6" placeholder="body { background-color: #000; }"
                    ></textarea>
                </div>

                <button
                    disabled={loading} onClick={handleSave}
                    className="w-full bg-[#f0f6fc] hover:bg-white text-[#0d1117] font-bold px-6 py-3 rounded-lg transition-all text-sm shadow-lg active:scale-95"
                >
                    Guardar Configuración
                </button>
            </div>
        </div>
    );
};

export default AdminPanel;