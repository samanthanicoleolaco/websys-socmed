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
import { jsonRequestHeaders } from '../httpHelpers';
import { useUser } from '../context/UserContext';

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
    const { user: authUser, setUser: setAuthUser, refreshUser } = useUser();
    const [activeTab, setActiveTab] = useState('account');
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
    const [textSize, setTextSize] = useState(() => localStorage.getItem('text-size') || 'medium');
    const [language, setLanguage] = useState('english');
    const fileInputRef = useRef(null);
    const [user, setUser] = useState({
        displayName: '',
        username: '',
        email: '',
        location: '',
        website: '',
        bio: '',
        petName: '',
        breed: '',
        age: '',
        petGender: 'unknown',
        petSpecies: '',
        petBirthday: '',
        petBio: '',
        avatar_url: null
    });
    
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

    const [privacy, setPrivacy] = useState({
        publicProfile: true,
        showLocation: true,
        messagesFromAnyone: false,
        showOnline: true,
        storyReplies: true,
        analytics: true
    });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (authUser) {
            const userSettings = authUser.user_settings || {};
            setUser({
                displayName: authUser.name || '',
                username: authUser.username ? '@' + authUser.username : (authUser.email ? '@' + authUser.email.split('@')[0] : ''),
                email: authUser.email || '',
                location: authUser.location || '',
                website: authUser.website || '',
                bio: authUser.bio || '',
                petName: authUser.pet?.name || '',
                breed: authUser.pet?.breed || '',
                age: authUser.pet?.age || '',
                petGender: authUser.pet?.gender || 'unknown',
                petSpecies: authUser.pet?.species || '',
                petBirthday: authUser.pet?.birthday ? String(authUser.pet.birthday).slice(0, 10) : '',
                petBio: authUser.pet?.bio || '',
                avatar_url: authUser.avatar_url || null
            });
            setNotifications({
                ...notifications,
                ...(userSettings.notifications || {}),
            });
            setPrivacy({
                ...privacy,
                ...(userSettings.privacy || {}),
            });
        }
    }, [authUser]);

    const fetchUser = async () => {
        try {
            await refreshUser();
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    useEffect(() => {
        document.documentElement.setAttribute('data-text-size', textSize);
        localStorage.setItem('text-size', textSize);
    }, [textSize]);


    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);
        setIsUploading(true);

        try {
            const response = await window.axios.post('/api/user/profile-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true,
            });
            const timestamp = new Date().getTime();
            setUser(prev => ({ 
                ...prev, 
                avatar_url: `${response.data.avatar_url}?t=${timestamp}` 
            }));
            
            // Persist to localStorage for other components to use as a quick cache if needed
            localStorage.setItem('user_avatar', `${response.data.avatar_url}?t=${timestamp}`);
            
            alert('Profile picture saved successfully!');
            refreshUser();
        } catch (error) {
            console.error("Error uploading photo:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSaveChanges = async () => {
        try {
            await window.axios.post('/api/user/update', {
                name: user.displayName,
                username: user.username.replace(/^@/, ''),
                location: user.location,
                bio: user.bio,
                petName: user.petName,
                breed: user.breed,
                age: user.age,
                petGender: user.petGender,
                petSpecies: user.petSpecies,
                petBirthday: user.petBirthday,
                petBio: user.petBio,
                notifications,
                privacy,
            }, {
                headers: jsonRequestHeaders(),
                withCredentials: true,
            });
            alert('Account settings updated successfully!');
            refreshUser();
        } catch (error) {
            console.error("Error saving settings:", error);
            alert('Failed to save settings.');
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
                {/* Top Row: Title + Save Changes */}
                <div className="account-card-header">
                    <h2>Account</h2>
                    <button className="save-btn" onClick={handleSaveChanges}>Save Changes</button>
                </div>

                {/* Profile Header */}
                <div className="account-profile-header">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handlePhotoChange} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                    />
                    <div className={`avatar-container ${isUploading ? 'uploading' : ''}`} onClick={triggerFileInput}>
                        <img 
                            key={user.avatar_url}
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=898AA6&color=fff`} 
                            alt="Profile" 
                            className="profile-avatar-img" 
                        />
                        <div className="camera-badge">
                            {isUploading ? (
                                <div className="spinner-mini" />
                            ) : (
                                <Camera size={14} weight="fill" />
                            )}
                        </div>
                    </div>
                    <div className="profile-info">
                        <h3>{user.displayName}</h3>
                        <p className="username">{user.username}</p>
                    </div>
                </div>

                {/* Account Form */}
                <div className="account-form">
                    {/* Row 1: Display Name | Username */}
                    <div className="form-row two-col">
                        <div className="form-group">
                            <label className="form-label">Display Name</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={user.displayName}
                                onChange={(e) => setUser({...user, displayName: e.target.value})}
                                placeholder="Your full name"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={user.username}
                                onChange={(e) => setUser({...user, username: e.target.value})}
                                placeholder="@username"
                            />
                        </div>
                    </div>

                    {/* Row 2: Email (Full Width) */}
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label className="form-label">Email Address</label>
                            <div className="input-with-icon">
                                <Envelope size={18} />
                                <input 
                                    type="email" 
                                    className="form-input" 
                                    value={user.email}
                                    onChange={(e) => setUser({...user, email: e.target.value})}
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Location | Website */}
                    <div className="form-row two-col">
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={user.location}
                                onChange={(e) => setUser({...user, location: e.target.value})}
                                placeholder="City, Country"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Website</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={user.website}
                                onChange={(e) => setUser({...user, website: e.target.value})}
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                    </div>

                    {/* Row 4: Bio (Full Width) */}
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label className="form-label">Bio</label>
                            <textarea 
                                className="form-textarea" 
                                rows={3}
                                value={user.bio}
                                onChange={(e) => setUser({...user, bio: e.target.value})}
                                placeholder="Living life one tail wag at a time. 🐾"
                            />
                        </div>
                    </div>
                </div>

                {/* Pet Info Section */}
                <div className="pet-profile-section">
                    <div className="section-title">
                        <PawPrint size={18} weight="fill" />
                        <span>Pet Info</span>
                    </div>
                    <div className="section-divider" />
                    
                    <div className="account-form">
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label className="form-label">Pet Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={user.petName}
                                    onChange={(e) => setUser({...user, petName: e.target.value})}
                                    placeholder="Mochi"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Breed</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={user.breed}
                                    onChange={(e) => setUser({...user, breed: e.target.value})}
                                    placeholder="Golden Retriever"
                                />
                            </div>
                        </div>

                        <div className="form-row two-col">
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={user.age}
                                    onChange={(e) => setUser({...user, age: e.target.value})}
                                    placeholder="2 years"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pet Bio</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={user.petBio}
                                    onChange={(e) => setUser({...user, petBio: e.target.value})}
                                    placeholder="The goodest boy..."
                                />
                            </div>
                        </div>

                        <div className="form-row two-col">
                            <div className="form-group">
                                <label className="form-label">Species</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={user.petSpecies}
                                    onChange={(e) => setUser({...user, petSpecies: e.target.value})}
                                    placeholder="Dog"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Birthday</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={user.petBirthday || ''}
                                    onChange={(e) => setUser({...user, petBirthday: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label className="form-label">Gender</label>
                                <select
                                    className="form-input"
                                    value={user.petGender}
                                    onChange={(e) => setUser({...user, petGender: e.target.value})}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="unknown">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password & Security Section */}
                <div className="password-section">
                    <div className="section-title">
                        <Shield size={18} weight="fill" />
                        <span>Password & Security</span>
                    </div>
                    <div className="section-divider" />
                    
                    <div className="account-form">
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input 
                                    type="password" 
                                    className="form-input" 
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input 
                                    type="password" 
                                    className="form-input" 
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* 2FA Success Box */}
                        <div className="two-factor-success">
                            <CheckCircle size={18} weight="fill" />
                            <span>Two-factor authentication is <strong>enabled</strong> on your account.</span>
                        </div>
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
            <Card className="settings-card">
                <div className="settings-content-header" style={{ marginBottom: '24px' }}>
                    <h2>Privacy</h2>
                    <Button variant="primary" onClick={() => alert('Privacy settings saved!')}>Save Changes</Button>
                </div>
                
                <div className="privacy-list">
                    <div className="privacy-item">
                        <div className="privacy-text">
                            <h4>Public pet info</h4>
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
            <Card className="settings-card">
                <div className="settings-content-header" style={{ marginBottom: '24px' }}>
                    <h2>Notifications</h2>
                    <Button variant="primary">Save Changes</Button>
                </div>
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
            <Card className="settings-card">
                <div className="settings-content-header" style={{ marginBottom: '24px' }}>
                    <h2>Appearance</h2>
                    <Button variant="primary">Save Changes</Button>
                </div>
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
