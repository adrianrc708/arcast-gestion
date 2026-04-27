import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App' // Eliminada la extensión .jsx
// import './index.css' // Comentado temporalmente si no existe

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* BrowserRouter es OBLIGATORIO para que react-router-dom funcione */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)