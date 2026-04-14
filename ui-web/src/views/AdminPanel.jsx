import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('import');
    const [msg, setMsg] = useState({ text: '', type: '' });

    const showSuccess = (text) => setMsg({ text, type: 'success' });
    const showError = (text) => setMsg({ text, type: 'error' });
    const clearMsg = () => setMsg({ text: '', type: '' });

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
            {/* Sidebar de Control */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
                <h2 className="text-xs font-black text-[#58a6ff] uppercase tracking-[0.2em] mb-6 px-4 border-l-2 border-[#58a6ff]">Centro de Control</h2>
                {[
                    { id: 'import', label: '1. Importar (TMDB)' },
                    { id: 'movies', label: '2. Gestión de Películas' },
                    { id: 'tvshows', label: '3. Gestión de Series' },
                    { id: 'reviews', label: '4. Moderar Reseñas' },
                    { id: 'users', label: '5. Usuarios y Roles' },
                    { id: 'system', label: '6. Sistema Global' },
                    { id: 'audit', label: '7. Registro de Auditoría' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); clearMsg(); }}
                        className={`w-full text-left px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                            activeTab === tab.id
                                ? 'bg-[#58a6ff] text-[#0d1117] shadow-lg shadow-[#58a6ff]/20 translate-x-2'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </aside>

            {/* Área Principal */}
            <main className="flex-1 space-y-6">
                {msg.text && (
                    <div className={`p-4 rounded-xl border text-sm font-bold flex justify-between items-center animate-in slide-in-from-top ${
                        msg.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
                    }`}>
                        <span>{msg.type === 'success' ? '✅' : '❌'} {msg.text}</span>
                        <button onClick={clearMsg} className="opacity-50 hover:opacity-100">✕</button>
                    </div>
                )}

                <div className="bg-[#161b22]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 min-h-[600px] shadow-2xl">
                    {activeTab === 'import' && <TabImport onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'movies' && <TabMovies onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'tvshows' && <TabTVShows onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'reviews' && <TabReviews onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'users' && <TabUsers onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'system' && <TabSystem onSuccess={showSuccess} onError={showError} />}
                    {activeTab === 'audit' && <TabAudit onSuccess={showSuccess} onError={showError} />}
                </div>
            </main>
        </div>
    );
};

// ==========================================
// PESTAÑA 2: GESTIÓN DE PELÍCULAS
// ==========================================
const TabMovies = ({ onSuccess, onError }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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

    const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
    const currentItems = filteredMovies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

    const handleDelete = async (id, title) => {
        if(!window.confirm(`¿Eliminar "${title}"?`)) return;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) await api.put(`/catalog/movies/${editingId}`, formData);
            else await api.post('/catalog/movies', formData);
            onSuccess(editingId ? 'Actualizada.' : 'Creada.');
            setShowForm(false);
            fetchMovies();
        } catch (err) { onError('Error al guardar.'); }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
                <div className="flex-1 w-full max-w-md">
                    <h3 className="text-2xl font-black text-white mb-4">Catálogo de Películas</h3>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                        <input type="text" placeholder="Buscar película..." value={searchTerm} onChange={handleSearch} className="admin-search-input" />
                    </div>
                </div>
                <button onClick={() => { setFormData({title:'', overview:'', releaseDate:'', watchLink:'', trailerKey:'', posterUrl:''}); setEditingId(null); setShowForm(true); }} className="btn-new-item">
                    + Nueva Película
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#0d1117] p-6 rounded-2xl border border-[#58a6ff]/20 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input required type="text" placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="modern-input-admin" />
                        <input type="text" placeholder="Fecha Estreno" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} className="modern-input-admin" />
                        <input type="text" placeholder="URL Póster" value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} className="modern-input-admin" />
                        <input type="text" placeholder="ID Trailer" value={formData.trailerKey} onChange={e => setFormData({...formData, trailerKey: e.target.value})} className="modern-input-admin" />
                    </div>
                    <textarea placeholder="Sinopsis..." value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})} className="w-full modern-input-admin" rows="3"></textarea>
                    <div className="flex gap-4 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 font-bold text-sm">Cancelar</button>
                        <button type="submit" className="bg-[#238636] text-white px-6 py-2 rounded-lg font-bold text-sm">Guardar</button>
                    </div>
                </form>
            )}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead><tr><th>Obra</th><th>Lanzamiento</th><th className="text-right">Gestión</th></tr></thead>
                    <tbody>
                    {currentItems.map(m => (
                        <tr key={m._id}>
                            <td className="flex items-center gap-4">
                                <img src={m.posterUrl} className="w-10 h-14 rounded object-cover" alt="" />
                                <span className="font-bold text-white">{m.title}</span>
                            </td>
                            <td className="text-xs font-mono opacity-50">{m.releaseDate}</td>
                            <td className="text-right space-x-4">
                                <button onClick={() => handleEditClick(m)} className="text-[#58a6ff] text-xs font-black uppercase">Editar</button>
                                <button onClick={() => handleDelete(m._id, m.title)} className="text-red-500 text-xs font-black uppercase">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination-container">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="pagination-btn">Anterior</button>
                    <div className="pagination-numbers">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i+1} onClick={() => setCurrentPage(i+1)} className={`num-btn ${currentPage === i+1 ? 'active' : ''}`}>{i+1}</button>
                        ))}
                    </div>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="pagination-btn">Siguiente</button>
                </div>
            )}
        </div>
    );
};

// ==========================================
// PESTAÑA 3: GESTIÓN DE SERIES (COMPLETA)
// ==========================================
const TabTVShows = ({ onSuccess, onError }) => {
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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

    const filteredShows = shows.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalPages = Math.ceil(filteredShows.length / itemsPerPage);
    const currentItems = filteredShows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) await api.put(`/catalog/tvshows/${editingId}`, formData);
            else await api.post('/catalog/tvshows', formData);
            onSuccess(editingId ? 'Actualizada.' : 'Creada.');
            setShowForm(false);
            fetchShows();
        } catch (err) { onError('Error al guardar.'); }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
                <div className="flex-1 w-full max-w-md">
                    <h3 className="text-2xl font-black text-white mb-4">Catálogo de Series</h3>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                        <input type="text" placeholder="Buscar serie..." value={searchTerm} onChange={handleSearch} className="admin-search-input" />
                    </div>
                </div>
                <button onClick={() => { setFormData({name:'', overview:'', firstAirDate:'', seasons:1, watchLink:'', trailerKey:'', posterUrl:''}); setEditingId(null); setShowForm(true); }} className="btn-new-item">
                    + Nueva Serie
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#0d1117] p-6 rounded-2xl border border-[#58a6ff]/20 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input required type="text" placeholder="Nombre de la Serie" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="modern-input-admin" />
                        <input type="number" placeholder="Temporadas" value={formData.seasons} onChange={e => setFormData({...formData, seasons: e.target.value})} className="modern-input-admin" />
                        <input type="text" placeholder="URL Póster" value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} className="modern-input-admin" />
                        <input type="text" placeholder="ID Trailer" value={formData.trailerKey} onChange={e => setFormData({...formData, trailerKey: e.target.value})} className="modern-input-admin" />
                    </div>
                    <textarea placeholder="Sinopsis..." value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})} className="w-full modern-input-admin" rows="3"></textarea>
                    <div className="flex gap-4 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 font-bold text-sm">Cancelar</button>
                        <button type="submit" className="bg-[#238636] text-white px-6 py-2 rounded-lg font-bold text-sm">Guardar</button>
                    </div>
                </form>
            )}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead><tr><th>Obra</th><th>Temporadas</th><th className="text-right">Gestión</th></tr></thead>
                    <tbody>
                    {currentItems.map(s => (
                        <tr key={s._id}>
                            <td className="flex items-center gap-4">
                                <img src={s.posterUrl} className="w-10 h-14 rounded object-cover" alt="" />
                                <span className="font-bold text-white">{s.name}</span>
                            </td>
                            <td className="text-xs font-mono opacity-50">{s.seasons}</td>
                            <td className="text-right space-x-4">
                                <button onClick={() => handleEditClick(s)} className="text-[#58a6ff] text-xs font-black uppercase">Editar</button>
                                <button onClick={() => handleDelete(s._id, s.name)} className="text-red-500 text-xs font-black uppercase">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination-container">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="pagination-btn">Anterior</button>
                    <div className="pagination-numbers">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i+1} onClick={() => setCurrentPage(i+1)} className={`num-btn ${currentPage === i+1 ? 'active' : ''}`}>{i+1}</button>
                        ))}
                    </div>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="pagination-btn">Siguiente</button>
                </div>
            )}
        </div>
    );
};

// ==========================================
// PESTAÑA 5: USUARIOS Y ROLES
// ==========================================
const TabUsers = ({ onSuccess, onError }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = () => {
        setLoading(true);
        api.get('/users')
            .then(res => setUsers(res.data))
            .catch(() => onError("Error al cargar usuarios."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = async (userId, username, newRole) => {
        if (!window.confirm(`¿Cambiar rol de ${username} a ${newRole.toUpperCase()}?`)) return;
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            onSuccess(`Rol actualizado.`);
            fetchUsers();
        } catch (e) { onError("Error al actualizar."); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h3 className="text-xl font-bold text-white">Directorio de Usuarios</h3>
                <input type="text" placeholder="Filtrar por nombre o email..." className="admin-search-input max-w-xs" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead><tr><th>Usuario</th><th>Email</th><th>Rol Asignado</th></tr></thead>
                    <tbody>
                    {filteredUsers.map(u => (
                        <tr key={u._id}>
                            <td className="font-bold text-white">{u.username}</td>
                            <td className="text-sm opacity-60">{u.email}</td>
                            <td>
                                <select value={u.role} onChange={(e) => handleRoleChange(u._id, u.username, e.target.value)}
                                        className="bg-black/40 border border-white/10 text-[10px] font-black uppercase rounded-lg px-3 py-1 text-[#58a6ff]">
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
        </div>
    );
};

// ==========================================
// OTRAS PESTAÑAS (IMPORT, REVIEWS, SYSTEM)
// ==========================================
const TabImport = ({ onSuccess, onError }) => {
    const [id, setId] = useState('');
    const [loading, setLoading] = useState(false);
    const handleImport = async (type) => {
        if (!id) return onError('ID inválido.');
        setLoading(true);
        try {
            await api.post(`/catalog/import/${type}`, { externalId: id, provider: 'tmdb' });
            onSuccess(`Importado exitosamente.`);
            setId('');
        } catch (e) { onError('Error en importación.'); }
        finally { setLoading(false); }
    };
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4">Importar desde TMDB</h3>
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl bg-black/20 p-6 rounded-2xl border border-white/5">
                <input value={id} onChange={e => setId(e.target.value)} placeholder="ID de TMDB (ej: 550)" className="flex-1 modern-input-admin" />
                <button disabled={loading} onClick={() => handleImport('movie')} className="bg-[#238636] text-white font-black px-6 py-3 rounded-xl hover:scale-105 transition-transform">Película</button>
                <button disabled={loading} onClick={() => handleImport('tv')} className="bg-[#8957e5] text-white font-black px-6 py-3 rounded-xl hover:scale-105 transition-transform">Serie</button>
            </div>
        </div>
    );
};

const TabReviews = ({ onSuccess, onError }) => {
    const [reviews, setReviews] = useState([]);
    useEffect(() => { api.get('/reviews').then(res => setReviews(res.data)).catch(() => {}); }, []);
    const handleDelete = async (id) => {
        if(!window.confirm('¿Borrar reseña?')) return;
        try { await api.delete(`/reviews/${id}`); onSuccess('Borrada.'); setReviews(reviews.filter(r => r._id !== id)); } catch(e) { onError('Error.'); }
    };
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4">Moderación</h3>
            <div className="grid gap-4">
                {reviews.map(r => (
                    <div key={r._id} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-white">{r.username} <span className="text-[#58a6ff] ml-2">★ {r.rating}</span></p>
                            <p className="text-sm opacity-60 mt-1 italic">"{r.text}"</p>
                        </div>
                        <button onClick={() => handleDelete(r._id)} className="text-red-500 font-black text-xs uppercase">Borrar</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TabSystem = ({ onSuccess, onError }) => {
    const [config, setConfig] = useState({ customCSS: '', maintenanceMode: false });
    useEffect(() => { api.get('/system/config').then(res => setConfig(res.data)).catch(() => {}); }, []);
    const handleSave = async () => {
        try { await api.put('/system/config', config); onSuccess('Guardado.'); } catch (e) { onError('Error.'); }
    };
    return (
        <div className="space-y-6 max-w-2xl">
            <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4">Sistema Global</h3>
            <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer bg-white/5 p-5 rounded-2xl border border-white/5">
                    <input type="checkbox" checked={config.maintenanceMode} onChange={e => setConfig({...config, maintenanceMode: e.target.checked})} className="accent-[#58a6ff] w-5 h-5" />
                    <span className="font-bold text-white">Activar Modo Mantenimiento</span>
                </label>
                <textarea value={config.customCSS} onChange={e => setConfig({...config, customCSS: e.target.value})} className="w-full bg-black/40 border border-white/10 text-green-400 p-5 rounded-2xl font-mono text-xs" rows="6" placeholder="CSS Global..."></textarea>
                <button onClick={handleSave} className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-[#58a6ff] transition-colors uppercase tracking-widest">Aplicar Cambios</button>
            </div>
        </div>
    );
};

// ==========================================
// PESTAÑA 7: REGISTRO DE AUDITORÍA
// ==========================================
const ACTION_COLORS = {
    USER_ROLE_MUTATION:    'text-yellow-400',
    USER_PROFILE_MUTATION: 'text-blue-400',
    SYSTEM_UI_MUTATION:    'text-purple-400',
    CATALOG_IMPORT:        'text-green-400',
};

const TabAudit = ({ onError }) => {
    const [logs, setLogs]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit]   = useState(50);

    const fetchLogs = () => {
        setLoading(true);
        api.get(`/system/audit?limit=${limit}`)
            .then(res => setLogs(res.data))
            .catch(() => onError('Error al cargar el registro de auditoría.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchLogs(); }, [limit]);

    const formatDate = (iso) =>
        new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'medium' });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">Registro de Auditoría</h3>
                    <p className="text-xs text-gray-500 mt-1">Historial de mutaciones administrativas del sistema</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-xs text-gray-400 font-bold">Mostrar:</label>
                    <select
                        value={limit}
                        onChange={e => setLimit(Number(e.target.value))}
                        className="bg-black/40 border border-white/10 text-white text-xs rounded-lg px-3 py-2"
                    >
                        {[25, 50, 100, 200].map(n => (
                            <option key={n} value={n}>{n} registros</option>
                        ))}
                    </select>
                    <button
                        onClick={fetchLogs}
                        className="bg-[#58a6ff]/10 border border-[#58a6ff]/30 text-[#58a6ff] text-xs font-black px-4 py-2 rounded-lg hover:bg-[#58a6ff]/20 transition-colors"
                    >
                        ↻ Actualizar
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-20 text-gray-600">
                    <p className="text-4xl mb-4">📋</p>
                    <p className="font-bold">Sin registros de auditoría aún.</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Acción</th>
                            <th>Usuario ID</th>
                            <th>Detalles</th>
                            <th>IP</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logs.map(log => (
                            <tr key={log._id}>
                                <td className="text-xs font-mono opacity-60 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                                <td>
                                        <span className={`text-xs font-black uppercase tracking-wider ${ACTION_COLORS[log.action] || 'text-gray-400'}`}>
                                            {log.action}
                                        </span>
                                </td>
                                <td className="text-xs font-mono opacity-50 truncate max-w-[120px]">{log.userId}</td>
                                <td className="text-xs opacity-70 max-w-[200px] truncate">
                                    {JSON.stringify(log.details)}
                                </td>
                                <td className="text-xs font-mono opacity-40">{log.ip}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;