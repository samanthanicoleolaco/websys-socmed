import React from "react";
import { motion } from "framer-motion";
import {
    Layout, Article, ChartBar, Gear, SignOut,
    MagnifyingGlass, Moon, Sun
} from "@phosphor-icons/react";
import { useTheme } from "../hooks/useTheme";

const AdminSidebar = ({ activeTab, onTabChange }) => {
    const [theme, setTheme] = useTheme();
    const isDarkMode = theme === "dark";

    const items = [
        { id: "dashboard", icon: <Layout size={22} />,    label: "Dashboard" },
        { id: "posts",     icon: <Article size={22} />,   label: "Posts Management" },
        { id: "reports",   icon: <ChartBar size={22} />,  label: "Reports & Analytics" },
        { id: "settings",  icon: <Gear size={22} />,      label: "System Settings" },
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrfToken) return;
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
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar__brand">
                <span className="admin-sidebar__brand-mark">A</span>
                <div>
                    <span className="admin-sidebar__brand-name">Petverse</span>
                    <span className="admin-sidebar__brand-role">Admin Console</span>
                </div>
            </div>

            <nav className="admin-sidebar__nav">
                {items.map((item) => {
                    const active = item.id === activeTab;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            className={`admin-nav-item ${active ? "active" : ""}`}
                            onClick={() => onTabChange(item.id)}
                        >
                            {active && (
                                <motion.div
                                    layoutId="active-admin-pill"
                                    className="admin-nav-item__bg"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="admin-nav-item__icon">{item.icon}</span>
                            <span className="admin-nav-item__label">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="admin-sidebar__footer">
                <button className="admin-sidebar__logout" onClick={handleLogout}>
                    <SignOut size={18} />
                    <span>Log out</span>
                </button>
                <button
                    className="admin-sidebar__theme"
                    onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                    title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
