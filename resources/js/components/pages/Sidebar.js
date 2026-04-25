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
    SignOut
} from "@phosphor-icons/react";
import BottomNav from "../BottomNav";
import { useUser } from "../../context/UserContext";

const typeMeta = {
    like:    { icon: Heart,       color: "#ef4444", label: "liked your post" },
    comment: { icon: ChatCircle,  color: "#3b82f6", label: "commented on your post" },
    follow:  { icon: UserPlus,    color: "#22c55e", label: "started following you" },
    contest: { icon: Trophy,      color: "#f59e0b", label: "contest update" },
    message: { icon: ChatCircle,  color: "#898AA6", label: "sent you a message" },
    default: { icon: PawPrint,    color: "#898AA6", label: "notification" },
};

const Sidebar = ({ brandText = "Petverse" }) => {
    const { user } = useUser();
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

    const navItems = [
        { icon: <House size={22} />,       label: "Home",          route: "/homefeed"     },
        { icon: <Bell size={22} />,        label: "Notifications", route: "/notifications", isNotifTrigger: true },
        { icon: <ChatCircle size={22} />,  label: "Messages",      route: "/messages"      },
        { icon: <Medal size={22} />,       label: "Badges",        route: "/badges"        },
        { icon: <Heart size={22} />,       label: "Adoption",      route: "/adoption"      },
        { 
            icon: user?.avatar_url ? (
                <div className="sidebar-user-avatar">
                    <img src={user.avatar_url} alt="Profile" />
                </div>
            ) : <User size={22} />,        
            label: "Profile",       
            route: "/profile"       
        },
        { icon: <Gear size={22} />,        label: "Settings",      route: "/settings"      },
        { icon: <SignOut size={22} />,     label: "Logout",        route: "#",             isLogout: true },
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/logout';
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_token';
            input.value = csrfToken;
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        }
    };

    const isActive = (route) => {
        if (route === "/") return currentPath === "/";
        return currentPath.startsWith(route);
    };

    const handleNav = (e, item) => {
        if (item.isLogout) {
            handleLogout(e);
            return;
        }
        
        e.preventDefault();
        if (item.isNotifTrigger) {
            toggleNotifications();
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
                <div className="sidebar-search">
                    <div className="sidebar-search__wrapper">
                        <MagnifyingGlass size={18} className="sidebar-search__icon" />
                        <input
                            type="text"
                            className="sidebar-search__input"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && searchQuery.trim()) {
                                    window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const active = isActive(item.route);
                        const notifActive = item.isNotifTrigger && isNotifOpen;
                        return (
                            <a
                                key={item.label}
                                href={item.route}
                                onClick={(e) => handleNav(e, item)}
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
                                <span className="nav-label" style={{ position: "relative", zIndex: 1 }}>{item.label}</span>
                            </a>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <p>© 2024 Petverse</p>
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
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
