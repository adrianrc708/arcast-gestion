import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const res = isLogin
            ? await login(form.email, form.password)
            : await register(form.username, form.email, form.password);

        if (!res.success) setError(res.message);
    };

    return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center px-4 font-sans text-[#e6edf3]">
            <div className="w-full max-w-[340px] space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isLogin ? "Let's log you in" : "Create your account"}
                    </h1>
                    <p className="text-[#8b949e] text-sm">
                        {isLogin ? "Welcome back, you've been missed!" : "Join the Arcast community today"}
                    </p>
                </div>

                {error && (
                    <div className="bg-[#f851491a] border border-[#f8514966] text-[#f85149] p-3 rounded-lg text-xs text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text" placeholder="Username" required
                            className="w-full bg-[#161b22] border border-[#30363d] p-3 rounded-lg outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all text-sm"
                            onChange={e => setForm({...form, username: e.target.value})}
                        />
                    )}
                    <input
                        type="email" placeholder="Email address" required
                        className="w-full bg-[#161b22] border border-[#30363d] p-3 rounded-lg outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all text-sm"
                        onChange={e => setForm({...form, email: e.target.value})}
                    />
                    <input
                        type="password" placeholder="Password" required
                        className="w-full bg-[#161b22] border border-[#30363d] p-3 rounded-lg outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all text-sm"
                        onChange={e => setForm({...form, password: e.target.value})}
                    />

                    {isLogin && (
                        <div className="flex items-center justify-between text-[11px] text-[#8b949e] px-1">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="accent-[#58a6ff] rounded" />
                                <span>Remember me</span>
                            </label>
                            <span className="hover:text-[#58a6ff] cursor-pointer font-medium">Forgot Password?</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-[#f0f6fc] hover:bg-white text-[#0d1117] font-bold py-3 rounded-lg transition-all mt-2 active:scale-[0.98]"
                    >
                        {isLogin ? "Log In" : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-sm text-[#8b949e]">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-[#58a6ff] font-semibold hover:underline"
                    >
                        {isLogin ? "Sign Up" : "Log In"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;