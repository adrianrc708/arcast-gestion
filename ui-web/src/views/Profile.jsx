import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, login } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [editMessage, setEditMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const res = await api.get('/users/watchlist');
                setWatchlist(res.data);
            } catch (err) {
                console.error("Error al cargar Watchlist:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchWatchlist();
            setNewUsername(user.username);
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setEditMessage({ text: 'Actualizando...', type: 'info' });

        try {
            const res = await api.put('/users/me', { username: newUsername });
            setEditMessage({ text: 'Perfil actualizado correctamente.', type: 'success' });
            setIsEditing(false);
            alert('Nombre actualizado. Por favor, vuelve a iniciar sesión para ver los cambios reflejados.');
        } catch (error) {
            setEditMessage({
                text: error.response?.data?.message || 'Error al actualizar el perfil.',
                type: 'error'
            });
        }
    };

    if (!user) return <div className="py-20 text-center text-red-400">Debes iniciar sesión para ver tu perfil.</div>;

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-10 animate-in fade-in">
            <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-8 shadow-xl">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#58a6ff] to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-lg shrink-0">
                        {user.username?.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 w-full">
                        {!isEditing ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-white">{user.username}</h1>
                                    <p className="text-gray-400 font-medium">{user.email}</p>
                                    <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${
                                        user.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                                            user.role === 'boss' ? 'bg-purple-500/10 text-purple-400' :
                                                'bg-blue-500/10 text-blue-400'
                                    }`}>
                                        Rol: {user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-[#21262d] hover:bg-[#30363d] text-white font-bold px-4 py-2 rounded-lg border border-[#30363d] transition-colors text-sm"
                                >
                                    Editar Perfil
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="space-y-4 w-full max-w-md">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Nuevo Nombre de Usuario</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="w-full bg-[#0d1117] border border-[#30363d] text-white p-3 rounded-lg outline-none focus:border-[#58a6ff]"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditing(false); setEditMessage({text:'', type:''}); setNewUsername(user.username); }}
                                        className="px-4 py-2 text-sm text-gray-400 hover:text-white font-bold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold px-6 py-2 rounded-lg transition-colors text-sm"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        )}

                        {editMessage.text && (
                            <div className={`mt-4 p-3 rounded-lg text-sm font-bold ${
                                editMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                                    editMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                        'text-[#58a6ff]'
                            }`}>
                                {editMessage.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="border-b border-[#30363d] pb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white">Mi Lista de Seguimiento</h2>
                    <span className="bg-[#161b22] px-3 py-1 rounded-full text-xs font-bold text-gray-400 border border-[#30363d]">
                        {watchlist.length} Títulos
                    </span>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-[#58a6ff] animate-pulse">Cargando tu lista...</div>
                ) : watchlist.length === 0 ? (
                    <div className="bg-[#161b22] border-2 border-dashed border-[#30363d] rounded-2xl p-12 text-center">
                        <p className="text-gray-400 text-lg mb-2">Tu lista está vacía.</p>
                        <p className="text-gray-500 text-sm">Explora el catálogo y usa el botón "+ Mi Lista" para guardar películas aquí.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {watchlist.map((item) => (
                            <Link
                                key={item._id}
                                to={`/movie/${item._id}`}
                                className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] block"
                            >
                                <img
                                    src={item.posterUrl || "https://via.placeholder.com/300x450?text=Sin+P%C3%B3ster"}
                                    alt={item.title || item.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                    <p className="text-white font-bold text-sm leading-tight line-clamp-2">
                                        {item.title || item.name}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;