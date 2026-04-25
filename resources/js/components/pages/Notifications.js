import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    ChatCircle,
    UserPlus,
    Trophy,
    Check,
    Trash,
    Bell,
    BellSlash,
} from "@phosphor-icons/react";
import Sidebar from "./Sidebar";
import "../../../sass/pages/notifications.scss";

const typeMeta = {
    like:    { icon: Heart,       color: "#ef4444", label: "liked your post" },
    comment: { icon: ChatCircle,  color: "#3b82f6", label: "commented on your post" },
    follow:  { icon: UserPlus,    color: "#22c55e", label: "started following you" },
    contest: { icon: Trophy,      color: "#f59e0b", label: "contest update" },
    message: { icon: ChatCircle,  color: "#898AA6", label: "sent you a message" },
    default: { icon: Bell,        color: "#898AA6", label: "notification" },
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all | unread

    const fetchNotifications = async () => {
        try {
            const res = await window.axios.get("/api/notifications");
            const data = res.data?.data || res.data || [];
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

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

    const markAllAsRead = async () => {
        try {
            await window.axios.post("/api/notifications/mark-all-read");
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
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

    const filtered = filter === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications;

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="notifications-page">
            <Sidebar />

            <main className="notifications-main">
                <div className="notifications-header">
                    <div>
                        <h1 className="notifications-title">Notifications</h1>
                        <p className="notifications-sub">
                            Stay updated with your pet community {unreadCount > 0 && <span className="unread-dot">{unreadCount} new</span>}
                        </p>
                    </div>
                    <div className="notifications-actions">
                        <button
                            className={`filter-btn ${filter === "all" ? "active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === "unread" ? "active" : ""}`}
                            onClick={() => setFilter("unread")}
                        >
                            Unread
                        </button>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={markAllAsRead}>
                                <Check size={16} weight="bold" /> Mark all read
                            </button>
                        )}
                    </div>
                </div>

                <div className="notifications-list">
                    {loading ? (
                        <div className="notifications-empty">
                            <div className="skeleton-row" />
                            <div className="skeleton-row" />
                            <div className="skeleton-row" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="notifications-empty">
                            <div className="empty-icon">
                                {filter === "unread" ? <BellSlash size={40} /> : <Bell size={40} />}
                            </div>
                            <h3>{filter === "unread" ? "No unread notifications" : "All caught up!"}</h3>
                            <p>{filter === "unread" ? "You have read all your notifications." : "Check back later for likes, comments, and more."}</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {filtered.map((n) => {
                                const meta = typeMeta[n.type] || typeMeta.default;
                                const Icon = meta.icon;
                                return (
                                    <motion.div
                                        key={n.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className={`notification-card ${!n.is_read ? "unread" : ""}`}
                                    >
                                        <div
                                            className="notification-dot"
                                            style={{ background: meta.color }}
                                        >
                                            <Icon size={14} weight="fill" color="#fff" />
                                        </div>
                                        <div className="notification-body">
                                            <p className="notification-text">
                                                <strong>{n.title || "Petverse"}</strong>{" "}
                                                {n.message || meta.label}
                                            </p>
                                            <span className="notification-time">
                                                {n.created_at
                                                    ? new Date(n.created_at).toLocaleString()
                                                    : "Just now"}
                                            </span>
                                        </div>
                                        <div className="notification-actions">
                                            {!n.is_read && (
                                                <button
                                                    className="icon-btn read-btn"
                                                    onClick={() => markAsRead(n.id)}
                                                    title="Mark as read"
                                                >
                                                    <Check size={16} weight="bold" />
                                                </button>
                                            )}
                                            <button
                                                className="icon-btn delete-btn"
                                                onClick={() => deleteNotification(n.id)}
                                                title="Delete"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;
