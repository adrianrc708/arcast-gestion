import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [form, setForm] = useState({ user: '', pass: '' });
    const [err, setErr] = useState('');
    const { login } = useAuth();

    const handle = async (e) => {
        e.preventDefault();
        setErr('');
        const res = await login(form.user, form.pass);
        if (!res.success) setErr(res.message);
    };

    return (
        <div className="login-page-root">
            <div className="login-glass-card">
                <div className="text-center">
                    <h1 className="login-title">ARCAST</h1>
                    <p className="login-subtitle">Plataforma Institucional</p>
                </div>

                {err && <div className="login-error">{err}</div>}

                <form onSubmit={handle} className="login-form">
                    <div className="login-input-group">
                        <label>USUARIO</label>
                        <input
                            type="text"
                            placeholder="Ingresa tu usuario"
                            required
                            className="login-input"
                            onChange={e => setForm({...form, user: e.target.value})}
                        />
                    </div>
                    <div className="login-input-group">
                        <label>CONTRASEÑA</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            className="login-input"
                            onChange={e => setForm({...form, pass: e.target.value})}
                        />
                    </div>
                    <button className="login-btn">Ingresar</button>
                </form>
            </div>
        </div>
    );
};

export default Login;