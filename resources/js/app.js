require('./bootstrap');

import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from './components/login';
import Feed from './components/Feed';
import AdminDashboard from './components/AdminDashboard';
import Register from './components/Register';
import Messages from './components/Messages';
import BadgesContests from './components/BadgesContests';
import AdoptionBoard from './components/AdoptionBoard';
import Settings from './components/Settings';

// Render components
const container = document.getElementById('sam-virtudazo');
if (container) {
    const root = createRoot(container);
    
    // Simple routing based on path
    const path = window.location.pathname;
    // Home "/" must show Feed — do not bundle with /login or sidebar "Home" loads the login screen
    if (path === '/login') {
        root.render(<Login />);
    } else if (path === '/register') {
        root.render(<Register />);
    } else if (path.startsWith('/admin')) {
        root.render(<AdminDashboard />);
    } else if (path === '/messages') {
        root.render(<Messages />);
    } else if (path === '/badges') {
        root.render(<BadgesContests />);
    } else if (path === '/adoption' || path.startsWith('/adoption/')) {
        root.render(<AdoptionBoard />);
    } else if (path === '/settings') {
        root.render(<Settings />);
    } else {
        root.render(<Feed />);
    }
}
