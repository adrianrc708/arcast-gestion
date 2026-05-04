import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full z-50 h-16 flex items-center justify-between px-8">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white">
                ARCAST<span className="text-[#38bdf8]">.</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
                <input type="text" placeholder="Buscar..." className="pill-input text-sm w-64 outline-none" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#38bdf8] to-blue-800 flex items-center justify-center font-bold">A</div>
            </div>
        </nav>
    );
};

export default Navbar;