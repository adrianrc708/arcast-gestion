import React, { useState } from 'react';
import api from '../services/api';

const AdminPanel = () => {
    const [id, setId] = useState('');
    const [msg, setMsg] = useState({ t: '', type: '' });

    const importContent = async (type) => {
        if (!id) return;
        setMsg({ t: 'Procesando...', type: 'info' });
        try {
            await api.post(`/catalog/import/${type}`, { externalId: id, provider: 'tmdb' });
            setMsg({ t: 'Importación exitosa', type: 'success' });
            setId('');
        } catch (e) { setMsg({ t: e.message, type: 'error' }); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <header className="text-center">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Content Manager</h2>
                <div className="h-1 w-20 bg-cyan-500 mx-auto mt-4"></div>
            </header>
            <div className="bg-[#1e293b] p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl space-y-8">
                <div>
                    <h3 className="text-cyan-400 font-black text-sm uppercase tracking-widest mb-4">Sincronización con TMDB</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            value={id} onChange={e => setId(e.target.value)}
                            placeholder="ID de TMDB (p.ej: 550)"
                            className="flex-1 bg-[#0f172a] border border-gray-700 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => importContent('movie')} className="bg-cyan-600 hover:bg-cyan-500 text-[#0f172a] font-black px-6 py-4 rounded-2xl transition-all">PELÍCULA</button>
                            <button onClick={() => importContent('tv')} className="bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-4 rounded-2xl transition-all">SERIE</button>
                        </div>
                    </div>
                    {msg.t && <p className={`mt-4 text-center font-bold text-xs ${msg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{msg.t}</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;