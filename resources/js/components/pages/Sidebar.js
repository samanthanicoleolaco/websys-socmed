import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    House,
    ChatCircle,
    Medal,
    Heart,
    User,
    Gear,
    Moon,
    Sun,
    PawPrint,
    Bell,
    UserPlus,
    Trophy,
    Check,
    Trash,
    X,
    MagnifyingGlass,
    SignOut,
} from "@phosphor-icons/react";
import BottomNav from "../BottomNav";

const typeMeta = {
    like:    { icon: Heart,       color: "#ef4444", label: "liked your post" },
    comment: { icon: ChatCircle,  color: "#3b82f6", label: "commented on your post" },
    follow:  { icon: UserPlus,    color: "#22c55e", label: "started following you" },
    contest: { icon: Trophy,      color: "#f59e0b", label: "contest update" },
    message: { icon: ChatCircle,  color: "#898AA6", label: "sent you a message" },
    default: { icon: PawPrint,    color: "#898AA6", label: "notification" },
};

const SearchResults = ({ query }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) return;
            setLoading(true);
            try {
                const res = await window.axios.get(`/api/pets?search=${encodeURIComponent(query.trim())}`);
                setResults(res.data.data || res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    if (loading) {
        return <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Searching...</div>;
    }

    if (results.length === 0) {
        return <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No pets found.</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {results.map(pet => (
                <a key={pet.id} href={`/pets/${pet.id}`} style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', 
                    textDecoration: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)'
                }} className="search-result-item">
                    <img src={pet.image_url || "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png"} alt={pet.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{pet.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pet.breed || "Pet"}</span>
                    </div>
                </a>
            ))}
        </div>
    );
};

const Sidebar = ({ brandText = "Petverse", navItems: propNavItems, bottomItems, onNavClick }) => {
    const currentPath = window.location.pathname;

    // Read persisted preference on mount
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem("petverse_theme");
        return saved === "dark";
    });

    // Apply theme to <html> on mount AND whenever it changes
    useEffect(() => {
        const theme = isDarkMode ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("petverse_theme", theme);
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode((prev) => !prev);

    // Notification panel state
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    const fetchNotifications = async () => {
        setNotifLoading(true);
        try {
            const res = await window.axios.get("/api/notifications");
            const data = res.data?.data || res.data || [];
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setNotifLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await window.axios.patch(`/api/notifications/${id}`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await window.axios.delete(`/api/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await window.axios.post("/api/notifications/mark-all-read");
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleNotifications = () => {
        const next = !isNotifOpen;
        setIsNotifOpen(next);
        if (next && notifications.length === 0) {
            fetchNotifications();
        }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const defaultNavItems = [
        { icon: <House size={22} />,       label: "Home",          route: "/"             },
        { icon: <Bell size={22} />,        label: "Notifications", route: "/notifications", isNotifTrigger: true },
        { icon: <ChatCircle size={22} />,  label: "Messages",      route: "/messages"      },
        { icon: <Medal size={22} />,       label: "Badges",        route: "/badges"        },
        { icon: <Heart size={22} />,       label: "Adoption",      route: "/adoption"      },
        { icon: <User size={22} />,        label: "Profile",       route: "/profile"       },
        { icon: <Gear size={22} />,        label: "Settings",      route: "/settings"      },
        { icon: <SignOut size={22} />,     label: "Sign Out",      route: "#",             isSignOut: true },
    ];

    const navItems = propNavItems || defaultNavItems;

    const isActive = (route) => {
        if (route === "#") return false;
        if (route === "/") return currentPath === "/";
        return currentPath.startsWith(route);
    };

    const handleNav = async (e, item) => {
        e.preventDefault();
        if (item.isNotifTrigger) {
            toggleNotifications();
            return;
        }
        if (item.isSignOut) {
            try {
                await window.axios.post('/logout');
                window.location.href = '/login';
            } catch (err) {
                console.error('Logout failed', err);
                window.location.href = '/login';
            }
            return;
        }
        window.location.href = item.route;
    };

    return (
        <>
            <aside className="sidebar-aside">
                {/* Logo */}
                <div className="sidebar-logo">
                    <img src="/petlogo.png" alt="Petverse Logo" className="logo-image" />
                    <span className="logo-text">{brandText}</span>
                </div>

                {/* Search Bar */}
                <div className="sidebar-search" style={{ position: 'relative' }}>
                    <div className="sidebar-search__wrapper">
                        <MagnifyingGlass size={18} className="sidebar-search__icon" />
                        <input
                            type="text"
                            className="sidebar-search__input"
                            placeholder="Search pets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Search Dropdown */}
                    <AnimatePresence>
                        {searchQuery.trim().length > 0 && (
                            <motion.div 
                                className="search-dropdown"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    marginTop: '8px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    zIndex: 50,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <SearchResults query={searchQuery} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const active = propNavItems ? item.active : isActive(item.route);
                        const notifActive = item.isNotifTrigger && isNotifOpen;
                        const label = item.label || item.text;
                        return (
                            <a
                                key={item.id || label}
                                href={item.route || "#"}
                                onClick={(e) => {
                                    if (onNavClick && propNavItems) {
                                        e.preventDefault();
                                        onNavClick(item);
                                    } else {
                                        handleNav(e, item);
                                    }
                                }}
                                className={`nav-item ${active || notifActive ? "active" : ""}`}
                            >
                                {(active || notifActive) && (
                                    <motion.div
                                        layoutId="active-sidebar-pill"
                                        className="nav-item-active-bg"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="nav-icon" style={{ position: "relative", zIndex: 1 }}>
                                    {item.icon}
                                    {item.isNotifTrigger && unreadCount > 0 && (
                                        <span className="nav-badge">{unreadCount}</span>
                                    )}
                                </span>
                                <span className="nav-label" style={{ position: "relative", zIndex: 1 }}>{label}</span>
                            </a>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    {bottomItems && bottomItems.map((item) => (
                        <a
                            key={item.id || item.text}
                            href="#"
                            onClick={async (e) => {
                                e.preventDefault();
                                if (item.id === 'logout') {
                                    try {
                                        await window.axios.post('/logout');
                                        window.location.href = '/login';
                                    } catch (err) {
                                        console.error('Logout failed', err);
                                        window.location.href = '/login';
                                    }
                                }
                            }}
                            className="nav-item"
                            style={{ marginBottom: '15px' }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.text || item.label}</span>
                        </a>
                    ))}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <p style={{ margin: 0 }}>© 2024 Petverse</p>
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Notification Panel */}
            <AnimatePresence>
                {isNotifOpen && (
                    <>
                        <motion.div
                            className="notif-panel__backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsNotifOpen(false)}
                        />
                        <motion.div
                            className="notif-panel"
                            initial={{ x: 60, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 60, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                        <div className="notif-panel__header">
                            <h2>Notifications</h2>
                            <div className="notif-panel__actions">
                                {unreadCount > 0 && (
                                    <button className="mark-all-btn" onClick={markAllAsRead} title="Mark all read">
                                        <Check size={14} weight="bold" />
                                    </button>
                                )}
                                <button className="close-btn" onClick={() => setIsNotifOpen(false)} title="Close">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="notif-panel__list">
                            {notifLoading ? (
                                <div className="notif-panel__empty">
                                    <div className="skeleton-row" />
                                    <div className="skeleton-row" />
                                    <div className="skeleton-row" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="notif-panel__empty">
                                    <Bell size={32} />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const meta = typeMeta[n.type] || typeMeta.default;
                                    const Icon = meta.icon;
                                    const isFollowRequest = n.type === "follow";
                                    return (
                                        <motion.div
                                            key={n.id}
                                            layout
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -12 }}
                                            className={`notif-panel__item ${!n.is_read ? "unread" : ""}`}
                                        >
                                            <div className="notif-panel__dot" style={{ background: meta.color }}>
                                                <Icon size={12} weight="fill" color="#fff" />
                                            </div>
                                            <div className="notif-panel__body">
                                                <p>
                                                    <strong>{n.title || "Petverse"}</strong>{" "}
                                                    {n.message || meta.label}
                                                </p>
                                                <span>{n.created_at ? new Date(n.created_at).toLocaleString() : "Just now"}</span>
                                                {isFollowRequest && (
                                                    <div className="notif-panel__req-actions">
                                                        <button className="confirm-btn" onClick={() => markAsRead(n.id)}>Confirm</button>
                                                        <button className="delete-btn" onClick={() => deleteNotification(n.id)}>Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                            {!isFollowRequest && !n.is_read && (
                                                <button className="icon-btn read-btn" onClick={() => markAsRead(n.id)} title="Mark as read">
                                                    <Check size={14} weight="bold" />
                                                </button>
                                            )}
                                            {!isFollowRequest && (
                                                <button className="icon-btn delete-btn" onClick={() => deleteNotification(n.id)} title="Delete">
                                                    <Trash size={14} />
                                                </button>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav />
        </>
    );
};

export default Sidebar;
