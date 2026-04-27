import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                // Endpoint del backend para obtener la lista guardada
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
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMsg({ text: 'Guardando cambios...', type: 'info' });
        try {
            // Llama a PUT /api/users/me (Lógica de auditoría en backend)
            await api.put('/users/me', { username: newUsername });
            setMsg({ text: '¡Nombre de usuario actualizado! Por favor, reinicia sesión para aplicar cambios globales.', type: 'success' });
            setIsEditing(false);
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Error al actualizar.', type: 'error' });
        }
    };

    if (!user) return <div className="py-20 text-center text-red-400 font-bold uppercase tracking-tighter">Acceso denegado.</div>;

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. SECCIÓN DE INFORMACIÓN DE CUENTA */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-[2rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#58a6ff]/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#8957e5] flex items-center justify-center text-5xl font-black text-white shadow-[0_0_30px_rgba(88,166,255,0.3)]">
                        {user.username?.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 w-full text-center md:text-left">
                        {!isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-4xl font-black text-white tracking-tighter">{user.username}</h1>
                                    <p className="text-gray-500 font-medium">{user.email}</p>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className="bg-[#58a6ff]/10 text-[#58a6ff] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#58a6ff]/20">
                                        ID: {user.role}
                                    </span>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-[#21262d] hover:bg-[#30363d] text-white font-bold px-5 py-1.5 rounded-full border border-[#30363d] transition-all text-xs"
                                    >
                                        Ajustar Perfil
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-sm mx-auto md:mx-0">
                                <input
                                    type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full bg-[#0d1117] border border-[#30363d] text-white p-3 rounded-xl outline-none focus:border-[#58a6ff] text-sm font-bold"
                                    placeholder="Nuevo nombre..."
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-[#238636] text-white font-bold py-2 rounded-xl text-xs">Guardar</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-[#21262d] text-gray-400 font-bold py-2 rounded-xl text-xs">Cancelar</button>
                                </div>
                            </form>
                        )}
                        {msg.text && <p className={`mt-4 text-xs font-bold ${msg.type === 'error' ? 'text-red-400' : 'text-[#58a6ff]'}`}>{msg.text}</p>}
                    </div>
                </div>
            </div>

            {/* 2. SECCIÓN WATCHLIST (MI LISTA) */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Mi Lista de Seguimiento</h2>
                    <span className="text-[10px] font-black text-gray-500 bg-[#161b22] px-3 py-1 rounded-full border border-[#30363d] uppercase tracking-widest">
                        {watchlist.length} Títulos Guardados
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                        {[1,2,3,4,5].map(i => <div key={i} className="aspect-[2/3] bg-[#161b22] rounded-2xl animate-pulse"></div>)}
                    </div>
                ) : watchlist.length === 0 ? (
                    <div className="bg-[#161b22] border-2 border-dashed border-[#30363d] rounded-[2rem] py-20 text-center">
                        <div className="text-4xl mb-4 opacity-20">🎞️</div>
                        <p className="text-gray-400 font-bold text-lg">Tu lista está vacía actualmente.</p>
                        <Link to="/" className="text-[#58a6ff] text-sm font-black hover:underline mt-4 inline-block uppercase tracking-widest">Explorar Catálogo</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {watchlist.map((item) => (
                            <Link
                                key={item._id}
                                to={`/${item.title ? 'movie' : 'tv'}/${item._id}`}
                                className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#161b22] border border-[#30363d] transition-all hover:border-[#58a6ff]/50 hover:shadow-[0_0_30px_rgba(88,166,255,0.1)] block"
                            >
                                <img
                                    src={item.posterUrl || "https://via.placeholder.com/300x450?text=Sin+Poster"}
                                    alt={item.title || item.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <p className="text-white font-black text-xs leading-tight uppercase tracking-tighter">
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