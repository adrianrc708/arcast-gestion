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
                    { id: 'users', label: '5. Usuarios y Roles' },
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
            onSuccess(`Contenido importado exitosamente.`);
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
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                <input
                    value={id} onChange={e => setId(e.target.value)}
                    placeholder="ID de TMDB (ej: 550)"
                    className="flex-1 bg-[#0d1117] border border-[#30363d] text-white p-3 rounded-lg outline-none focus:border-[#58a6ff] font-mono text-sm"
                />
                <button disabled={loading} onClick={() => handleImport('movie')} className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold px-6 py-3 rounded-lg transition-all text-sm disabled:opacity-50">Traer Película</button>
                <button disabled={loading} onClick={() => handleImport('tv')} className="bg-[#8957e5] hover:bg-[#9e6cff] text-white font-bold px-6 py-3 rounded-lg transition-all text-sm disabled:opacity-50">Traer Serie</button>
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
    const [formData, setFormData] = useState({ title: '', overview: '', releaseDate: '', watchLink: '', trailerKey: '', posterUrl: '' });

    const fetchMovies = () => {
        setLoading(true);
        api.get('/catalog/movies')
            .then(res => setMovies(res.data))
            .catch(() => onError("Error al cargar películas."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchMovies(); }, []);

    const handleDelete = async (id, title) => {
        if(!window.confirm(`¿Eliminar la película "${title}"?`)) return;
        try {
            await api.delete(`/catalog/movies/${id}`);
            onSuccess('Película eliminada.');
            fetchMovies();
        } catch (e) { onError(e.message); }
    };

    const handleEditClick = (movie) => {
        setFormData({
            title: movie.title || '', overview: movie.overview || '', releaseDate: movie.releaseDate || '',
            watchLink: movie.watchLink || '', trailerKey: movie.trailerKey || '', posterUrl: movie.posterUrl || ''
        });
        setEditingId(movie._id);
        setShowForm(true);
    };

    const handleNewClick = () => {
        setFormData({ title: '', overview: '', releaseDate: '', watchLink: '', trailerKey: '', posterUrl: '' });
        setEditingId(null);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/catalog/movies/${editingId}`, formData);
                onSuccess('Película actualizada.');
            } else {
                await api.post('/catalog/movies', formData);
                onSuccess('Película creada.');
            }
            setShowForm(false);
            fetchMovies();
        } catch (error) {
            onError(error.response?.data?.message || 'Error al guardar.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
                <h3 className="text-xl font-bold text-white">Catálogo de Películas</h3>
                <button onClick={handleNewClick} className="bg-[#f0f6fc] text-[#0d1117] font-bold px-4 py-2 rounded-lg text-sm hover:bg-white">+ Nueva</button>
            </div>
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] space-y-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input required type="text" placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="Fecha Estreno" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="URL Póster" value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="ID Trailer YouTube" value={formData.trailerKey} onChange={e => setFormData({...formData, trailerKey: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="Enlace para ver" value={formData.watchLink} onChange={e => setFormData({...formData, watchLink: e.target.value})} className="sm:col-span-2 bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                    </div>
                    <textarea placeholder="Sinopsis..." value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})} className="w-full bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm resize-none" rows="3"></textarea>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 font-bold">Cancelar</button>
                        <button type="submit" className="bg-[#238636] text-white font-bold px-4 py-2 rounded-lg text-sm">Guardar</button>
                    </div>
                </form>
            )}
            {loading ? <p className="text-gray-500">Cargando...</p> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#0d1117] text-gray-300">
                        <tr><th className="px-4 py-3">Título</th><th className="px-4 py-3 text-right">Acciones</th></tr>
                        </thead>
                        <tbody>
                        {movies.map(m => (
                            <tr key={m._id} className="border-b border-[#30363d]"><td className="px-4 py-3 text-white">{m.title}</td><td className="px-4 py-3 text-right"><button onClick={() => handleEditClick(m)} className="text-blue-400 mr-3">Editar</button><button onClick={() => handleDelete(m._id, m.title)} className="text-red-400">Eliminar</button></td></tr>
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
    const [formData, setFormData] = useState({ name: '', overview: '', firstAirDate: '', seasons: 1, watchLink: '', trailerKey: '', posterUrl: '' });

    const fetchShows = () => {
        setLoading(true);
        api.get('/catalog/tvshows')
            .then(res => setShows(res.data))
            .catch(() => onError("Error al cargar series."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchShows(); }, []);

    const handleDelete = async (id, name) => {
        if(!window.confirm(`¿Eliminar la serie "${name}"?`)) return;
        try {
            await api.delete(`/catalog/tvshows/${id}`);
            onSuccess('Serie eliminada.');
            fetchShows();
        } catch (e) { onError(e.message); }
    };

    const handleEditClick = (show) => {
        setFormData({
            name: show.name || '', overview: show.overview || '', firstAirDate: show.firstAirDate || '',
            seasons: show.seasons || 1, watchLink: show.watchLink || '', trailerKey: show.trailerKey || '', posterUrl: show.posterUrl || ''
        });
        setEditingId(show._id);
        setShowForm(true);
    };

    const handleNewClick = () => {
        setFormData({ name: '', overview: '', firstAirDate: '', seasons: 1, watchLink: '', trailerKey: '', posterUrl: '' });
        setEditingId(null);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/catalog/tvshows/${editingId}`, formData);
                onSuccess('Serie actualizada.');
            } else {
                await api.post('/catalog/tvshows', formData);
                onSuccess('Serie creada.');
            }
            setShowForm(false);
            fetchShows();
        } catch (error) {
            onError(error.response?.data?.message || 'Error al guardar.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
                <h3 className="text-xl font-bold text-white">Catálogo de Series</h3>
                <button onClick={handleNewClick} className="bg-[#f0f6fc] text-[#0d1117] font-bold px-4 py-2 rounded-lg text-sm hover:bg-white">+ Nueva</button>
            </div>
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] space-y-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input required type="text" placeholder="Nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="number" min="1" placeholder="Temporadas" value={formData.seasons} onChange={e => setFormData({...formData, seasons: Number(e.target.value)})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="URL Póster" value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="ID Trailer YouTube" value={formData.trailerKey} onChange={e => setFormData({...formData, trailerKey: e.target.value})} className="bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                        <input type="text" placeholder="Enlace para ver" value={formData.watchLink} onChange={e => setFormData({...formData, watchLink: e.target.value})} className="sm:col-span-2 bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm" />
                    </div>
                    <textarea placeholder="Sinopsis..." value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})} className="w-full bg-[#161b22] border border-[#30363d] text-white p-2 rounded-lg text-sm resize-none" rows="3"></textarea>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 font-bold">Cancelar</button>
                        <button type="submit" className="bg-[#238636] text-white font-bold px-4 py-2 rounded-lg text-sm">Guardar</button>
                    </div>
                </form>
            )}
            {loading ? <p className="text-gray-500">Cargando...</p> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#0d1117] text-gray-300">
                        <tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3 text-right">Acciones</th></tr>
                        </thead>
                        <tbody>
                        {shows.map(s => (
                            <tr key={s._id} className="border-b border-[#30363d]"><td className="px-4 py-3 text-white">{s.name}</td><td className="px-4 py-3 text-right"><button onClick={() => handleEditClick(s)} className="text-blue-400 mr-3">Editar</button><button onClick={() => handleDelete(s._id, s.name)} className="text-red-400">Eliminar</button></td></tr>
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
        api.get('/reviews')
            .then(res => setReviews(res.data))
            .catch(() => onError("Error al cargar las reseñas."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleDeleteReview = async (id) => {
        if(!window.confirm(`¿Eliminar esta reseña?`)) return;
        try {
            await api.delete(`/reviews/${id}`);
            onSuccess('Reseña eliminada.');
            fetchReviews();
        } catch(e) { onError("No se pudo eliminar."); }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-[#30363d] pb-4">Moderación de Reseñas</h3>
            {loading ? <p className="text-gray-500">Cargando...</p> : reviews.length === 0 ? <p className="text-gray-500">No hay reseñas.</p> : (
                <div className="space-y-4">
                    {reviews.map(r => (
                        <div key={r._id} className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] flex justify-between items-start">
                            <div>
                                <p className="font-bold text-white text-sm">{r.username} <span className="text-yellow-500 text-xs ml-2">★ {r.rating}/5</span></p>
                                <p className="text-sm text-gray-300 mt-1">{r.text}</p>
                            </div>
                            <button onClick={() => handleDeleteReview(r._id)} className="text-red-400 text-xs font-bold">Eliminar</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==========================================
// PESTAÑA 5: GESTIÓN DE USUARIOS Y ROLES (NUEVO)
// ==========================================
const TabUsers = ({ onSuccess, onError }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = () => {
        setLoading(true);
        api.get('/users')
            .then(res => setUsers(res.data))
            .catch(() => onError("Error al cargar usuarios."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    // FUNCIÓN EXACTA QUE PEDISTE: El admin cambia el rol
    const handleRoleChange = async (userId, username, newRole) => {
        if (!window.confirm(`¿Cambiar el rol de ${username} a ${newRole.toUpperCase()}?`)) return;
        try {
            // Petición a la nueva ruta del backend
            await api.put(`/users/${userId}/role`, { role: newRole });
            onSuccess(`Rol de ${username} actualizado a ${newRole}.`);
            fetchUsers(); // Recarga la lista para ver el cambio
        } catch (e) {
            onError(e.response?.data?.message || "Error al actualizar el rol.");
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-[#30363d] pb-4">Usuarios Registrados</h3>
            {loading ? <p className="text-gray-500">Cargando usuarios...</p> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#0d1117] text-gray-300">
                        <tr>
                            <th className="px-4 py-3">Usuario</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Asignar Rol</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(u => (
                            <tr key={u._id} className="border-b border-[#30363d] hover:bg-[#0d1117]/50">
                                <td className="px-4 py-3 font-bold text-white">{u.username}</td>
                                <td className="px-4 py-3">{u.email}</td>
                                <td className="px-4 py-3">
                                    {/* SELECTOR DE ROL */}
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u._id, u.username, e.target.value)}
                                        className="bg-[#0d1117] border border-[#30363d] text-white text-xs font-bold uppercase rounded px-3 py-1.5 outline-none focus:border-[#58a6ff] cursor-pointer"
                                    >
                                        <option value="user">USER</option>
                                        <option value="admin">ADMIN</option>
                                        <option value="boss">BOSS</option>
                                    </select>
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
            onSuccess('Configuración guardada.');
        } catch (e) { onError(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h3 className="text-xl font-bold text-white border-b border-[#30363d] pb-4">Configuración del Sistema</h3>
            <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer bg-[#0d1117] p-4 rounded-xl border border-[#30363d]">
                    <input type="checkbox" checked={config.maintenanceMode} onChange={e => setConfig({...config, maintenanceMode: e.target.checked})} className="accent-[#58a6ff] w-5 h-5" />
                    <span className="text-sm font-bold text-white">Modo Mantenimiento</span>
                </label>
                <textarea value={config.customCSS} onChange={e => setConfig({...config, customCSS: e.target.value})} className="w-full bg-[#0d1117] border border-[#30363d] text-green-400 p-4 rounded-lg outline-none font-mono text-xs resize-y" rows="4" placeholder="CSS Personalizado..."></textarea>
                <button disabled={loading} onClick={handleSave} className="w-full bg-[#f0f6fc] text-[#0d1117] font-bold px-6 py-3 rounded-lg text-sm">Guardar Configuración</button>
            </div>
        </div>
    );
};

export default AdminPanel;