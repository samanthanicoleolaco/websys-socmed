import React from 'react';
import { 
    House, 
    ChatCircle, 
    Medal, 
    Heart, 
    User, 
    Gear, 
    Bell 
} from "@phosphor-icons/react";

const BottomNavItem = ({ icon: IconComponent, label, route }) => {
    const currentPath = window.location.pathname;
    const isActive = route === '/' 
        ? currentPath === '/' 
        : currentPath.startsWith(route);

    const handleClick = (e) => {
        e.preventDefault();
        window.location.href = route;
    };

    return (
        <a 
            href={route} 
            onClick={handleClick}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={label}
        >
            <span className="icon">{IconComponent}</span>
            <span className="label">{label}</span>
        </a>
    );
};

const BottomNav = () => {
    const navItems = [
        { id: 'home', icon: <House size={24} weight="light" />, text: 'Home', path: '/' },
        { id: 'notifications', icon: <Bell size={24} weight="light" />, text: 'Notifications', path: '/notifications' },
        { id: 'messages', icon: <ChatCircle size={24} weight="light" />, text: 'Messages', path: '/messages' },
        { id: 'badges', icon: <Medal size={24} weight="light" />, text: 'Badges', path: '/badges' },
        { id: 'adoption', icon: <Heart size={24} weight="light" />, text: 'Adoption', path: '/adoption' },
        { id: 'profile', icon: <User size={24} weight="light" />, text: 'Profile', path: '/profile' },
        { id: 'settings', icon: <Gear size={24} weight="light" />, text: 'Settings', path: '/settings' }
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map(item => (
                <BottomNavItem 
                    key={item.id}
                    icon={item.icon}
                    label={item.text}
                    route={item.path}
                />
            ))}
        </nav>
    );
};

export default BottomNav;
