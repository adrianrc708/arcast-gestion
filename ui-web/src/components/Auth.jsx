import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { login, register } = useAuth(); //

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const res = isLogin
            ? await login(form.email, form.password)
            : await register(form.username, form.email, form.password);

        if (!res.success) setError(res.message);
    };

    // Solo cambia el JSX de retorno para limpiar las clases de Tailwind que estorban
    return (
        <div className="auth-screen-wrapper">
            <div className="auth-main-container">
                <div className="auth-header-text">
                    <h1>{isLogin ? "Inicia sesión" : "Crea tu cuenta"}</h1>
                    <p>{isLogin ? "¡Bienvenido de nuevo!" : "Únete a la comunidad Arcast hoy"}</p>
                </div>

                {error && <div className="auth-error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="arcast-auth-card">
                    {!isLogin && (
                        <div className="auth-input-field">
                            <label>Nombre de usuario</label>
                            <input
                                type="text" required
                                className="arcast-auth-input"
                                onChange={e => setForm({...form, username: e.target.value})}
                            />
                        </div>
                    )}

                    <div className="auth-input-field">
                        <label>Correo electrónico</label>
                        <input
                            type="email" required
                            className="arcast-auth-input"
                            onChange={e => setForm({...form, email: e.target.value})}
                        />
                    </div>

                    <div className="auth-input-field">
                        <div className="label-with-link">
                            <label>Contraseña</label>
                        </div>
                        <input
                            type="password" required
                            className="arcast-auth-input"
                            onChange={e => setForm({...form, password: e.target.value})}
                        />
                    </div>

                    <button type="submit" className="arcast-auth-btn">
                        {isLogin ? "Iniciar sesión" : "Registrarse"}
                    </button>
                </form>

                <div className="auth-footer-box">
                    <p>
                        {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        >
                            {isLogin ? "Crea una cuenta" : "Inicia sesión"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;