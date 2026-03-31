import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css';

try {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <App />
    )
} catch (error) {
    console.error("Critical Runtime Error:", error);
    document.body.innerHTML = `
        <div style="padding: 20px; color: red; font-family: sans-serif;">
            <h1>Critical Initialization Error</h1>
            <p>${error.message}</p>
            <pre>${error.stack}</pre>
        </div>
    `;
}
