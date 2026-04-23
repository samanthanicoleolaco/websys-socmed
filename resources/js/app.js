require('./bootstrap');

import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from './components/login';
import Feed from './components/pages/Feed';
import AdminDashboard from './components/AdminDashboard';
import Register from './components/Register';
import Messages from './components/pages/Messages';
import BadgesContests from './components/pages/BadgesContests';
import AdoptionBoard from './components/AdoptionBoard';
import Settings from './components/Settings';
import Profile from './components/pages/Profile';
import Notifications from './components/pages/Notifications';

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
    } else if (path === '/profile' || path.startsWith('/profile/')) {
        root.render(<Profile />);
    } else if (path === '/notifications') {
        root.render(<Notifications />);
    } else {
        root.render(<Feed />);
    }
}
