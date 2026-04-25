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

import { UserProvider, useUser } from './context/UserContext';

// Render components
const container = document.getElementById('sam-virtudazo');

if (container) {
    const root = createRoot(container);
    
    const AppContent = () => {
        const { user, loading } = useUser();
        const path = window.location.pathname;
        
        if (loading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' }}>
                    <div className="pawtastic-loader"></div>
                </div>
            );
        }

        if (path === '/login') return <Login />;
        if (path === '/register') return <Register />;

        if (!user) {
            window.location.href = '/login';
            return null;
        }

        if (path.startsWith('/admin')) return <AdminDashboard />;
        if (path === '/messages') return <Messages />;
        if (path === '/badges') return <BadgesContests />;
        if (path === '/adoption' || path.startsWith('/adoption/')) return <AdoptionBoard />;
        if (path === '/settings') return <Settings />;
        if (path === '/profile' || path.startsWith('/profile/')) return <Profile />;
        if (path === '/notifications') return <Notifications />;
        return <Feed />;
    };

    root.render(
        <UserProvider>
            <AppContent />
        </UserProvider>
    );
}
