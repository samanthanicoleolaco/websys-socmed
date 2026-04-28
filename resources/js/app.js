require('./bootstrap');

import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from './components/login';
import Feed from './components/pages/Feed';
import AdminDashboard from './components/AdminDashboard';
import Register from './components/Register';
import EmailVerify from './components/EmailVerify';
import PetInfo from './components/PetInfo';
import ResetPassword from './components/ResetPassword';
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
        if (path === '/password/reset') return <ResetPassword />;

        if (path === '/email/verify') {
            if (user?.email_verified_at) {
                if (!user.pet) {
                    window.location.href = '/pet-info';
                    return null;
                }

                window.location.href = '/homefeed';
                return null;
            }

            return <EmailVerify />;
        }

        if (path === '/pet-info') {
            if (user?.email_verified_at && user?.pet) {
                window.location.href = '/homefeed';
                return null;
            }

            return <PetInfo />;
        }

        if (!user) {
            window.location.href = '/login';
            return null;
        }

        if (!user.email_verified_at) {
            window.location.href = '/email/verify';
            return null;
        }

        if (!user.pet) {
            window.location.href = '/pet-info';
            return null;
        }

        // RBAC: regular users cannot render /admin pages even by typing the URL.
        if (path.startsWith('/admin')) {
            if (!user.is_admin) {
                window.location.replace('/homefeed');
                return null;
            }
            return <AdminDashboard />;
        }

        // Admins landing on a regular user page get bumped to the admin console.
        if (user.is_admin && (path === '/' || path === '/homefeed')) {
            window.location.replace('/admin');
            return null;
        }

        if (path === '/messages') return <Messages />;
        if (path === '/badges') return <BadgesContests />;
        if (path === '/adoption' || path.startsWith('/adoption/')) return <AdoptionBoard />;
        if (path === '/settings') return <Settings />;
        if (path === '/profile' || path.startsWith('/profile/')) return <Profile />;
        if (path === '/notifications') return <Notifications />;
        if (path === '/homefeed') return <Feed />;

        if (path === '/') {
            window.location.replace(user.is_admin ? '/admin' : '/homefeed');
            return null;
        }

        return user.is_admin ? <AdminDashboard /> : <Feed />;
    };

    root.render(
        <UserProvider>
            <AppContent />
        </UserProvider>
    );
}
