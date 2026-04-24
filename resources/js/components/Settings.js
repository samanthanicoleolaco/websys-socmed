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
    SignOut,
    MapPin,
    Link,
    FileText,
    FloppyDisk,
    Smiley,
    Desktop,
    Translate,
    Power,
    Devices,
    SignIn
} from "@phosphor-icons/react";
import Sidebar from './pages/Sidebar';
import axios from 'axios';

// ── UI Components ───────────

const Card = ({ children, className = "" }) => (
    <div className={`settings-card ${className}`}>
        {children}
    </div>
);

const Switch = ({ checked, onCheckedChange }) => (
    <button 
        className={`settings-switch ${checked ? 'active' : ''}`}
        onClick={() => onCheckedChange(!checked)}
        type="button"
    >
        <span className="switch-thumb" />
    </button>
);

const Button = ({ children, variant = "primary", className = "", ...props }) => (
    <button className={`settings-btn ${variant} ${className}`} {...props}>
        {children}
    </button>
);

const Input = ({ className = "", ...props }) => (
    <input className={`settings-input ${className}`} {...props} />
);

const Label = ({ children }) => <label className="settings-label">{children}</label>;

// ── Settings Component ──────────────────────────────────────────────────

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account');
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
    const [textSize, setTextSize] = useState('medium');
    const [language, setLanguage] = useState('english');
    const fileInputRef = useRef(null);
    const [user, setUser] = useState({
        displayName: 'Sarah & Mochi',
        username: '@mochi_adventures',
        email: 'sarah@petverse.com',
        location: 'San Francisco, CA',
        website: '',
        bio: 'Living life one tail wag at a time.',
        petName: 'Mochi',
        breed: 'Golden Retriever',
        age: '2 years',
        petBio: 'The goodest boy in the world'
    });
    
    // Privacy toggles
    const [privacy, setPrivacy] = useState({
        publicProfile: true,
        showLocation: true,
        messagesFromAnyone: true,
        showOnline: true,
        storyReplies: true,
        analytics: false
    });
    
    // Notification toggles
    const [notifications, setNotifications] = useState({
        likes: true,
        comments: true,
        newFollowers: true,
        mentions: true,
        adoptionUpdates: true,
        contestAlerts: true,
        messages: true,
        weeklyDigest: false,
        push: true
    });

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
        }
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: <User size={18} /> },
        { id: 'privacy', label: 'Privacy', icon: <Lock size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'appearance', label: 'Appearance', icon: <PaintBrush size={18} /> },
        { id: 'danger', label: 'Danger Zone', icon: <Warning size={18} />, danger: true },
    ];

    const renderAccount = () => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="settings-section"
        >
            <Card className="account-card">
                {/* Card Header - Account Title + Save Button */}
                <div className="account-card-header">
                    <h2>Account</h2>
                    <Button variant="primary">Save Changes</Button>
                </div>

                {/* Profile Photo Section - Inline */}
                <div className="account-profile-header">
                    <div className="avatar-with-camera">
                        <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&h=150&fit=crop" alt="Profile" className="profile-avatar-img" />
                        <button className="camera-btn">
                            <Camera size={14} weight="fill" />
                        </button>
                    </div>
                    <div className="profile-photo-text">
                        <h3>Sarah & Mochi</h3>
                        <p className="username">@mochi_adventures</p>
                        <button className="change-photo-link">Change profile photo</button>
                    </div>
                </div>

                {/* Form Grid - Exact Layout from Screenshot */}
                <div className="account-form">
                    {/* Row 1: Display Name | Username */}
                    <div className="settings-form-row two-col">
                        <div className="settings-form-group">
                            <label className="settings-form-label">DISPLAY NAME</label>
                            <input 
                                type="text" 
                                className="settings-form-input" 
                                value="Sarah & Mochi"
                                onChange={(e) => setUser({...user, displayName: e.target.value})}
                            />
                        </div>
                        <div className="settings-form-group">
                            <label className="settings-form-label">USERNAME</label>
                            <input 
                                type="text" 
                                className="settings-form-input" 
                                value="@mochi_adventures"
                                onChange={(e) => setUser({...user, username: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Row 2: Email (Full Width) */}
                    <div className="settings-form-row">
                        <div className="settings-form-group full-width">
                            <label className="settings-form-label">EMAIL ADDRESS</label>
                            <div className="input-icon-wrapper">
                                <Envelope size={16} className="input-icon" />
                                <input 
                                    type="email" 
                                    className="settings-form-input with-icon" 
                                    value="sarah@petverse.com"
                                    onChange={(e) => setUser({...user, email: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Location | Website */}
                    <div className="settings-form-row two-col">
                        <div className="settings-form-group">
                            <label className="settings-form-label">LOCATION</label>
                            <input 
                                type="text" 
                                className="settings-form-input" 
                                value="San Francisco, CA"
                                onChange={(e) => setUser({...user, location: e.target.value})}
                            />
                        </div>
                        <div className="settings-form-group">
                            <label className="settings-form-label">WEBSITE</label>
                            <input 
                                type="text" 
                                className="settings-form-input" 
                                placeholder="https://..."
                                value={user.website}
                                onChange={(e) => setUser({...user, website: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Row 4: Bio */}
                    <div className="settings-form-row">
                        <div className="settings-form-group full-width">
                            <label className="settings-form-label">BIO</label>
                            <textarea 
                                className="settings-form-textarea" 
                                rows={2}
                                value="Living life one tail wag at a time."
                                onChange={(e) => setUser({...user, bio: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="section-divider" />

                {/* Pet Profile */}
                <div className="pet-profile-section">
                    <div className="section-title-icon">
                        <PawPrint size={16} />
                        <span>Pet Profile</span>
                    </div>
                    
                    <div className="account-form">
                        {/* Row: Pet Name | Breed */}
                        <div className="settings-form-row two-col">
                            <div className="settings-form-group">
                                <label className="settings-form-label">PET NAME</label>
                                <input 
                                    type="text" 
                                    className="settings-form-input" 
                                    value="Mochi"
                                    onChange={(e) => setUser({...user, petName: e.target.value})}
                                />
                            </div>
                            <div className="settings-form-group">
                                <label className="settings-form-label">BREED</label>
                                <input 
                                    type="text" 
                                    className="settings-form-input" 
                                    value="Golden Retriever"
                                    onChange={(e) => setUser({...user, breed: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Row: Age | Pet Bio */}
                        <div className="settings-form-row two-col">
                            <div className="settings-form-group">
                                <label className="settings-form-label">AGE</label>
                                <input 
                                    type="text" 
                                    className="settings-form-input" 
                                    value="2 years"
                                    onChange={(e) => setUser({...user, age: e.target.value})}
                                />
                            </div>
                            <div className="settings-form-group">
                                <label className="settings-form-label">PET BIO</label>
                                <input 
                                    type="text" 
                                    className="settings-form-input" 
                                    value="The goodest boy in the world"
                                    onChange={(e) => setUser({...user, petBio: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="section-divider" />

                {/* Password & Security */}
                <div className="password-section">
                    <div className="section-title-icon">
                        <Shield size={16} />
                        <span>Password & Security</span>
                    </div>
                    
                    <div className="account-form">
                        <div className="settings-form-row two-col">
                            <div className="settings-form-group">
                                <label className="settings-form-label">CURRENT PASSWORD</label>
                                <input 
                                    type="password" 
                                    className="settings-form-input" 
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="settings-form-group">
                                <label className="settings-form-label">NEW PASSWORD</label>
                                <input 
                                    type="password" 
                                    className="settings-form-input" 
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="two-factor-success">
                        <CheckCircle size={16} weight="fill" />
                        <span>Two-factor authentication is <strong>enabled</strong> on your account.</span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );

    const renderPrivacy = () => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="settings-section"
        >
            <div className="settings-content-header">
                <h2>Privacy</h2>
                <Button variant="primary">Save Changes</Button>
            </div>

            <Card>
                <div className="privacy-list">
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Public pet profile</h4>
                            <p>Anyone can view your pet's profile and posts</p>
                        </div>
                        <Switch checked={privacy.publicProfile} onCheckedChange={(v) => setPrivacy({...privacy, publicProfile: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Show location on posts</h4>
                            <p>Display your city on posts and adoption listings</p>
                        </div>
                        <Switch checked={privacy.showLocation} onCheckedChange={(v) => setPrivacy({...privacy, showLocation: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Messages from anyone</h4>
                            <p>Receive messages from users you don't follow</p>
                        </div>
                        <Switch checked={privacy.messagesFromAnyone} onCheckedChange={(v) => setPrivacy({...privacy, messagesFromAnyone: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Show online status</h4>
                            <p>Let others see when you're active</p>
                        </div>
                        <Switch checked={privacy.showOnline} onCheckedChange={(v) => setPrivacy({...privacy, showOnline: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Story replies</h4>
                            <p>Allow replies to your stories</p>
                        </div>
                        <Switch checked={privacy.storyReplies} onCheckedChange={(v) => setPrivacy({...privacy, storyReplies: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Analytics & improvement</h4>
                            <p>Share anonymized data to improve PetVerse</p>
                        </div>
                        <Switch checked={privacy.analytics} onCheckedChange={(v) => setPrivacy({...privacy, analytics: v})} />
                    </div>
                </div>
            </Card>
        </motion.div>
    );

    const renderNotifications = () => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="settings-section"
        >
            <div className="settings-content-header">
                <h2>Notifications</h2>
                <Button variant="primary">Save Changes</Button>
            </div>

            <Card>
                <div className="notification-banner">
                    <Bell size={16} weight="fill" />
                    <span>You have 3 unread notifications this week.</span>
                </div>
                <div className="privacy-list">
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Likes & reactions</h4>
                            <p>When someone likes your posts</p>
                        </div>
                        <Switch checked={notifications.likes} onCheckedChange={(v) => setNotifications({...notifications, likes: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Comments</h4>
                            <p>When someone comments on your posts</p>
                        </div>
                        <Switch checked={notifications.comments} onCheckedChange={(v) => setNotifications({...notifications, comments: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>New followers</h4>
                            <p>When someone follows you</p>
                        </div>
                        <Switch checked={notifications.newFollowers} onCheckedChange={(v) => setNotifications({...notifications, newFollowers: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Mentions</h4>
                            <p>When someone mentions you</p>
                        </div>
                        <Switch checked={notifications.mentions} onCheckedChange={(v) => setNotifications({...notifications, mentions: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Adoption updates</h4>
                            <p>Updates about pets you've saved</p>
                        </div>
                        <Switch checked={notifications.adoptionUpdates} onCheckedChange={(v) => setNotifications({...notifications, adoptionUpdates: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Contest alerts</h4>
                            <p>New contests and results</p>
                        </div>
                        <Switch checked={notifications.contestAlerts} onCheckedChange={(v) => setNotifications({...notifications, contestAlerts: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Message notifications</h4>
                            <p>New messages and requests</p>
                        </div>
                        <Switch checked={notifications.messages} onCheckedChange={(v) => setNotifications({...notifications, messages: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Weekly email digest</h4>
                            <p>Weekly summary of community activity</p>
                        </div>
                        <Switch checked={notifications.weeklyDigest} onCheckedChange={(v) => setNotifications({...notifications, weeklyDigest: v})} />
                    </div>
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Push notifications</h4>
                            <p>Alerts on your mobile device</p>
                        </div>
                        <Switch checked={notifications.push} onCheckedChange={(v) => setNotifications({...notifications, push: v})} />
                    </div>
                </div>
            </Card>
        </motion.div>
    );

    const renderAppearance = () => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="settings-section"
        >
            <div className="settings-content-header">
                <h2>Appearance</h2>
                <Button variant="primary">Save Changes</Button>
            </div>

            <Card>
                <div className="appearance-section">
                    <Label>THEME</Label>
                    <div className="theme-cards">
                        <button 
                            className={`theme-card ${!isDark ? 'active' : ''}`}
                            onClick={() => setIsDark(false)}
                        >
                            <div className="theme-icon light">
                                <Sun size={24} weight="fill" />
                            </div>
                            <span className="theme-name">Light</span>
                            <span className="theme-status">{!isDark ? 'Active' : ''}</span>
                        </button>
                        <button 
                            className={`theme-card ${isDark ? 'active' : ''}`}
                            onClick={() => setIsDark(true)}
                        >
                            <div className="theme-icon dark">
                                <Moon size={24} weight="fill" />
                            </div>
                            <span className="theme-name">Dark</span>
                            <span className="theme-status">{isDark ? 'Active' : ''}</span>
                        </button>
                    </div>
                </div>

                <div className="appearance-divider" />

                <div className="appearance-section">
                    <Label>TEXT SIZE</Label>
                    <div className="text-size-buttons">
                        {['small', 'medium', 'large'].map((size) => (
                            <button
                                key={size}
                                className={`size-btn ${textSize === size ? 'active' : ''}`}
                                onClick={() => setTextSize(size)}
                            >
                                {size.charAt(0).toUpperCase() + size.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="appearance-divider" />

                <div className="appearance-section">
                    <Label>LANGUAGE</Label>
                    <div className="language-dropdown">
                        <GlobeSimple size={18} />
                        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="english">English (US)</option>
                            <option value="spanish">Spanish</option>
                            <option value="french">French</option>
                        </select>
                        <CaretRight size={16} className="dropdown-chevron" />
                    </div>
                </div>
            </Card>
        </motion.div>
    );

    const renderDangerZone = () => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="settings-section"
        >
            <div className="settings-content-header">
                <h2>Danger Zone</h2>
            </div>

            <Card className="danger-zone-card">
                <div className="danger-banner">
                    <Warning size={20} weight="fill" className="warning-icon" />
                    <div>
                        <h4>Danger Zone</h4>
                        <p>These actions are permanent and cannot be undone. Please proceed with caution.</p>
                    </div>
                </div>
            </Card>

            <Card className="danger-actions-card">
                <div className="danger-action-item">
                    <div className="danger-action-icon orange">
                        <Power size={20} />
                    </div>
                    <div className="danger-action-text">
                        <h4>Deactivate Account</h4>
                        <p>Temporarily hide your profile and posts from the community.</p>
                    </div>
                    <Button variant="danger-light">Deactivate</Button>
                </div>
                <div className="danger-action-divider" />
                <div className="danger-action-item">
                    <div className="danger-action-icon yellow">
                        <Devices size={20} />
                    </div>
                    <div className="danger-action-text">
                        <h4>Log Out of All Devices</h4>
                        <p>Sign out from every device where you're currently logged in.</p>
                    </div>
                    <Button variant="warning-light">Log Out All</Button>
                </div>
                <div className="danger-action-divider" />
                <div className="danger-action-item">
                    <div className="danger-action-icon red">
                        <Trash size={20} />
                    </div>
                    <div className="danger-action-text">
                        <h4>Delete Account</h4>
                        <p>Permanently delete your account and all associated data.</p>
                    </div>
                    <Button variant="danger">Delete Account</Button>
                </div>
            </Card>
        </motion.div>
    );

    return (
        <div className="settings-page">
            <Sidebar />
            
            <main className="settings-main">
                <div className="settings-container">
                    {/* Left Sidebar */}
                    <aside className="settings-sidebar">
                        <div className="settings-header">
                            <h1>Settings</h1>
                            <p>Manage your account and preferences</p>
                        </div>
                        <nav className="settings-nav">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''} ${tab.danger ? 'danger' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span className="nav-icon">{tab.icon}</span>
                                    <span className="nav-label">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <section className="settings-content">
                        <AnimatePresence mode="wait">
                            {activeTab === 'account' && renderAccount()}
                            {activeTab === 'privacy' && renderPrivacy()}
                            {activeTab === 'notifications' && renderNotifications()}
                            {activeTab === 'appearance' && renderAppearance()}
                            {activeTab === 'danger' && renderDangerZone()}
                        </AnimatePresence>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Settings;
