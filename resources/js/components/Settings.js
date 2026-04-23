import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Bell, 
    Lock, 
    User, 
    PawPrint, 
    Envelope, 
    Camera, 
    Moon, 
    Sun, 
    Trash, 
    ArrowSquareOut, 
    Shield, 
    PaintBrush, 
    GlobeSimple, 
    Phone, 
    CaretRight, 
    CheckCircle, 
    Warning,
    House,
    ArrowLeft,
    SignOut
} from "@phosphor-icons/react";
import Sidebar from './pages/Sidebar';

// ── UI Components (Internal implementations to match Shadcn) ───────────

const Card = ({ children, className = "" }) => (
    <div className={`ui-card ${className}`}>
        {children}
    </div>
);

const Switch = ({ checked, onCheckedChange }) => (
    <div 
        className="ui-switch" 
        data-state={checked ? "checked" : "unchecked"}
        onClick={() => onCheckedChange(!checked)}
    >
        <span className="thumb" />
    </div>
);

const Button = ({ children, variant = "primary", className = "", ...props }) => (
    <button className={`ui-button ${variant} ${className}`} {...props}>
        {children}
    </button>
);

const Input = (props) => (
    <input className="ui-input" {...props} />
);

const Separator = () => <div className="ui-separator" />;

const Label = ({ children }) => <label className="ui-label">{children}</label>;

const Avatar = ({ src, fallback, size = "md" }) => (
    <div className={`ui-avatar size-${size}`}>
        {src ? <img src={src} alt="avatar" /> : <div className="fallback">{fallback}</div>}
    </div>
);

// ── Settings Component ──────────────────────────────────────────────────

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleLogout = () => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/logout';
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = csrfToken;
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        } else {
            // Fallback
            window.location.href = "/login";
        }
    };

    const tabs = [
        { id: 'profile', label: 'Account', icon: <User size={20} /> },
        { id: 'security', label: 'Security', icon: <Shield size={20} /> },
        { id: 'notifs', label: 'Notifications', icon: <Bell size={20} /> },
        { id: 'appearance', label: 'Appearance', icon: <PaintBrush size={20} /> },
    ];

    const renderProfile = () => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="settings-section"
        >
            <div className="section-header">
                <h2>Account Settings</h2>
                <p>Manage your profile information and how others see you.</p>
            </div>

            <Card className="settings-card">
                <div className="profile-edit-header">
                    <div className="avatar-group">
                        <Avatar src="/images/avatar_dog.png" fallback="SV" size="xl" />
                        <div className="text">
                            <h3>Profile Picture</h3>
                            <div className="actions">
                                <Button variant="ghost" onClick={() => fileInputRef.current.click()}>Change Photo</Button>
                                <Button variant="ghost" className="danger">Remove</Button>
                            </div>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} hidden />
                </div>

                <Separator />

                <div className="form-grid">
                    <div className="field">
                        <Label>Display Name</Label>
                        <Input defaultValue="Sam Virtudazo" />
                    </div>
                    <div className="field">
                        <Label>Username</Label>
                        <Input defaultValue="sam_virtudazo" />
                    </div>
                    <div className="field-full">
                        <Label>Bio</Label>
                        <textarea className="ui-input" rows={4} defaultValue="Pet lover 🐾 Digital artist. Future golden retriever owner." />
                    </div>
                </div>

                <div className="form-footer">
                    <Button>Save Changes</Button>
                </div>
            </Card>
        </motion.div>
    );

    const renderAppearance = () => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="settings-section"
        >
            <div className="section-header">
                <h2>Appearance</h2>
                <p>Customize how the app looks on your device.</p>
            </div>

            <Card className="settings-card">
                <div className="setting-row">
                    <div className="info">
                        <Label>Dark Mode</Label>
                        <p>Toggle between light and dark themes.</p>
                    </div>
                    <Switch checked={isDark} onCheckedChange={setIsDark} />
                </div>
                <Separator />
                <div className="setting-row">
                    <div className="info">
                        <Label>Compact View</Label>
                        <p>Show more content with less whitespace.</p>
                    </div>
                    <Switch checked={false} onCheckedChange={() => {}} />
                </div>
            </Card>
        </motion.div>
    );

    const renderSecurity = () => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="settings-section"
        >
            <div className="section-header">
                <h2>Security & Login</h2>
                <p>Protect your account with advanced security features.</p>
            </div>

            <Card className="settings-card">
                <div className="field">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" />
                </div>
                <div className="field">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                </div>
                <Separator />
                <div className="setting-row-action">
                    <div className="info">
                        <Label>Two-Factor Authentication</Label>
                        <p>Add an extra layer of security to your account.</p>
                    </div>
                    <Button variant="ghost">Enable 2FA</Button>
                </div>
            </Card>

            <div className="danger-zone-compact">
                <h3>Danger Zone</h3>
                <Card className="danger-card">
                    <div className="setting-row">
                        <div className="info">
                            <Label>Deactivate Account</Label>
                            <p>Temporarily disable your account and hide your profile.</p>
                        </div>
                        <Button variant="ghost" className="danger">Deactivate</Button>
                    </div>
                </Card>
            </div>
        </motion.div>
    );

    return (
        <div className="modern-feed modern-settings">
            <Sidebar />
            
            <main className="settings-main-container">
                <div className="settings-layout">
                    {/* Sidebar Nav */}
                    <aside className="settings-nav-pane">
                        <div className="nav-header">
                            <h2>Settings</h2>
                        </div>
                        <nav className="nav-items-list">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span className="icon">{tab.icon}</span>
                                    <span className="label">{tab.label}</span>
                                    <CaretRight size={16} className="chevron" />
                                </button>
                            ))}
                        </nav>

                        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '24px' }}>
                            <Button 
                                variant="ghost" 
                                className="danger" 
                                style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}
                                onClick={handleLogout}
                            >
                                <SignOut size={20} />
                                <span style={{ fontWeight: '500' }}>Log Out</span>
                            </Button>
                        </div>
                    </aside>

                    {/* Content Pane */}
                    <section className="settings-content-pane">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && renderProfile()}
                            {activeTab === 'appearance' && renderAppearance()}
                            {activeTab === 'security' && renderSecurity()}
                            {/* ... more as needed */}
                        </AnimatePresence>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Settings;
