import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('settings');
    const [watchlist, setWatchlist] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de formulario
    const [username, setUsername] = useState(user?.username || '');
    const [passwords, setPasswords] = useState({ current: '', new: '' });
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [wRes, rRes] = await Promise.all([
                    api.get('/users/watchlist'),
                    api.get('/reviews/me')
                ]);
                setWatchlist(wRes.data.watchlist || []);
                setMyReviews(rRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    const handleUpdateName = async (e) => {
        e.preventDefault();
        try {
            await api.put('/users/me', { username });
            setMsg({ text: 'Nombre actualizado. Reinicia sesión para ver los cambios.', type: 'success' });
        } catch (err) { setMsg({ text: 'Error al actualizar nombre.', type: 'error' }); }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            await api.put('/users/update-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setMsg({ text: 'Contraseña actualizada.', type: 'success' });
            setPasswords({ current: '', new: '' });
        } catch (err) { setMsg({ text: err.response?.data?.message || 'Error.', type: 'error' }); }
    };

    if (!user) return <div className="py-20 text-center">Acceso Denegado</div>;

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="profile-header-premium">
                <div className="avatar-large">{user.username?.charAt(0).toUpperCase()}</div>
                <div>
                    <h1 className="text-4xl font-black">{user.username}</h1>
                    <p className="text-muted">{user.email} • <span className="text-accent uppercase">{user.role}</span></p>
                </div>
            </div>

            <div className="profile-tabs">
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Ajustes</button>
                <button className={activeTab === 'watchlist' ? 'active' : ''} onClick={() => setActiveTab('watchlist')}>Mi Lista ({watchlist.length})</button>
                <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Mis Reseñas ({myReviews.length})</button>
            </div>

            <div className="mt-10">
                {activeTab === 'settings' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="add-review-card">
                            <h3 className="mb-6">Información Personal</h3>
                            <form onSubmit={handleUpdateName} className="space-y-4">
                                <input className="modern-textarea" style={{height: '50px'}} type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nuevo nombre" />
                                <button type="submit" className="submit-review-btn">Guardar Cambios</button>
                            </form>
                        </div>
                        <div className="add-review-card">
                            <h3 className="mb-6">Seguridad</h3>
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <input className="modern-textarea" style={{height: '50px'}} type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} placeholder="Contraseña actual" />
                                <input className="modern-textarea" style={{height: '50px'}} type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} placeholder="Nueva contraseña" />
                                <button type="submit" className="submit-review-btn">Cambiar Contraseña</button>
                            </form>
                        </div>
                        {msg.text && <p className={`col-span-full text-center font-bold ${msg.type === 'error' ? 'text-red-400' : 'text-accent'}`}>{msg.text}</p>}
                    </div>
                )}

                {activeTab === 'watchlist' && (
                    <div className="catalog-grid">
                        {watchlist.map(entry => (
                            <Link key={entry._id} to={`/item/${entry.kind.toLowerCase()}/${entry.item._id}`} className="media-card">
                                <div className="poster-wrapper"><img src={entry.item.posterUrl} alt="" /></div>
                                <div className="card-info"><h3>{entry.item.title || entry.item.name}</h3></div>
                            </Link>
                        ))}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {myReviews.map(rev => (
                            <div key={rev._id} className="review-card-premium">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-accent font-black">{rev.movieTitle}</h4>
                                    <span className="user-rating-badge">★ {rev.rating}</span>
                                </div>
                                <p className="review-text">"{rev.text}"</p>
                                <p className="text-[10px] mt-4 opacity-50">{new Date(rev.date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;