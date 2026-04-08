import React, { useState } from 'react';

const SidebarIcons = {
    Home: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    Message: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    Trophy: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10M5 4h14v4a2 2 0 0 1-2 2h-1M6 10H5a2 2 0 0 1-2-2V4M12 17a5 5 0 0 0 5-5V4"></path></svg>,
    Paw: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Setting: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Logout: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
};

const Sidebar = ({ 
    brandText = "Pawtastic", 
    brandIcon = "/pet-logo.png"
}) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [hoveredNavItem, setHoveredNavItem] = useState(null);
    
    const currentPath = window.location.pathname;

    const navItems = [
        { id: 'home', path: '/', icon: <SidebarIcons.Home />, text: 'Home', active: currentPath === '/' },
        { id: 'messages', path: '/messages', icon: <SidebarIcons.Message />, text: 'Messages', active: currentPath.startsWith('/messages') },
        { id: 'badges', path: '/badges', icon: <SidebarIcons.Trophy />, text: 'Badges & Contests', active: currentPath.startsWith('/badges') },
        { id: 'adoption', path: '/adoption', icon: <SidebarIcons.Paw />, text: 'Adoption Board', active: currentPath.startsWith('/adoption') }
    ];

    const bottomItems = [
        { id: 'setting', path: '/settings', icon: <SidebarIcons.Setting />, text: 'Setting' },
        { id: 'logout', icon: <SidebarIcons.Logout />, text: 'Log out' }
    ];

    return (
        <nav className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="brand" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle Sidebar">
                <img src="/pet-logo.png" alt="Petly" className="brand-logo-full" />
            </div>
            <ul className="nav-links">
                {navItems.map(item => (
                    <li 
                        key={item.id} 
                        className={`${item.active ? 'active' : ''} ${hoveredNavItem === item.id ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredNavItem(item.id)}
                        onMouseLeave={() => setHoveredNavItem(null)}
                        onClick={() => {
                            if (item.path) window.location.href = item.path;
                        }}
                    >
                        <span className="nav-icon">{item.icon}</span> 
                        <span className="nav-text" style={brandText === 'Admin' ? {fontSize: '14px'} : {}}>{item.text}</span>
                    </li>
                ))}
            </ul>
            <ul className="bottom-links">
                {bottomItems.map(item => (
                    <li 
                        key={item.id}
                        className={hoveredNavItem === item.id ? 'hovered' : ''}
                        onMouseEnter={() => setHoveredNavItem(item.id)}
                        onMouseLeave={() => setHoveredNavItem(null)}
                        onClick={async () => {
                            if (item.onClick) {
                                item.onClick();
                            } else if (item.path) {
                                window.location.href = item.path;
                            } else if (item.id === 'logout') {
                                try {
                                    await window.axios.post('/logout');
                                } catch (e) {}
                                window.location.href = '/login'; 
                            }
                        }}
                    >
                        <span className="nav-icon">{item.icon}</span> 
                        <span className="nav-text" style={brandText === 'Admin' ? {fontSize: '14px'} : {}}>{item.text}</span>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Sidebar;
