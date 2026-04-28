import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('watchlist'); // Watchlist por defecto
    const [watchlist, setWatchlist] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState(user?.username || '');
    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [wRes, rRes] = await Promise.all([
                    api.get('/users/watchlist'),
                    api.get('/reviews/me').catch(() => ({ data: [] })) // Cambiado a /me
                ]);
                setWatchlist(wRes.data.watchlist || []);
                setMyReviews(rRes.data || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        if (user) fetchAll();
    }, [user]);

    const handleUpdateName = async (e) => {
        e.preventDefault();
        try {
            await api.put('/users/me', { username });
            setMsg({ text: 'Nombre actualizado. Se verá reflejado al reiniciar sesión.', type: 'success' });
        } catch (err) { setMsg({ text: 'Error al actualizar nombre.', type: 'error' }); }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) {
            return setMsg({ text: 'Las nuevas contraseñas no coinciden.', type: 'error' });
        }
        try {
            await api.put('/users/update-password', {
                currentPassword: passData.current,
                newPassword: passData.new
            });
            setMsg({ text: 'Contraseña cambiada con éxito.', type: 'success' });
            setPassData({ current: '', new: '', confirm: '' });
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Error al cambiar clave.', type: 'error' });
        }
    };

    if (!user) return <div className="py-20 text-center font-black">ACCESO DENEGADO</div>;

    return (
        <div className="profile-page-root">
            <div className="profile-container">
                <header className="profile-header">
                    <div className="avatar-circle-large">{user.username?.charAt(0).toUpperCase()}</div>
                    <div className="profile-titles">
                        <h1>{user.username}</h1>
                        <p>{user.email} • <span className="tag-premium">{user.role}</span></p>
                    </div>
                </header>

                <nav className="profile-tabs-nav">
                    <button className={activeTab === 'watchlist' ? 'active' : ''} onClick={() => setActiveTab('watchlist')}>Mi Lista ({watchlist.length})</button>
                    <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Mis Reseñas ({myReviews.length})</button>
                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Ajustes de Cuenta</button>
                </nav>

                <div className="profile-content">
                    {activeTab === 'watchlist' && (
                        <div className="profile-grid-watchlist">
                            {watchlist.map(w => (
                                <Link key={w._id} to={`/item/${w.kind.toLowerCase() === 'movie' ? 'movie' : 'tvshow'}/${w.item?._id}`} className="p-card">
                                    <div className="p-card-img"><img src={w.item?.posterUrl} alt="" /></div>
                                    <div className="p-card-info"><h4>{w.item?.title || w.item?.name}</h4></div>
                                </Link>
                            ))}
                            {watchlist.length === 0 && <p className="empty-info">Tu lista está vacía actualmente.</p>}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="profile-reviews-list">
                            {myReviews.map(r => (
                                <div key={r._id} className="p-review-card">
                                    <div className="p-review-header">
                                        <h4>{r.movieTitle}</h4>
                                        <span className="p-rating">★ {r.rating}</span>
                                    </div>
                                    <p className="p-text">"{r.text}"</p>
                                    <span className="p-date">{new Date(r.date).toLocaleDateString()}</span>
                                </div>
                            ))}
                            {myReviews.length === 0 && <p className="empty-info">Aún no has escrito ninguna reseña.</p>}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="profile-settings-grid">
                            <div className="glass-form-card">
                                <h3>Información Personal</h3>
                                <form onSubmit={handleUpdateName}>
                                    <div className="form-group-p">
                                        <label>Nuevo nombre de usuario</label>
                                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                                    </div>
                                    <button type="submit" className="btn-p-main">Guardar Cambios</button>
                                </form>
                            </div>

                            <div className="glass-form-card">
                                <h3>Cambiar Contraseña</h3>
                                <form onSubmit={handleUpdatePassword}>
                                    <div className="form-group-p">
                                        <input type="password" placeholder="Contraseña Actual" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} required />
                                    </div>
                                    <div className="form-group-p">
                                        <input type="password" placeholder="Nueva Contraseña" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} required />
                                    </div>
                                    <div className="form-group-p">
                                        <input type="password" placeholder="Confirmar Nueva Contraseña" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} required />
                                    </div>
                                    <button type="submit" className="btn-p-alt">Actualizar Seguridad</button>
                                </form>
                            </div>
                            {msg.text && <div className={`p-alert ${msg.type}`}>{msg.text}</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;