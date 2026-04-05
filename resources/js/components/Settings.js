import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Icons = {
    User: () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Lock: () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    Bell: () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    Shield: () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Mail: () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
};

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    
    // Mock user data
    const [profile, setProfile] = useState({
        firstName: 'Sam',
        lastName: 'Virtudazo',
        email: 'sam.virtudazo@example.com',
        username: 'sam_virtudazo',
        bio: 'Pet lover. Digital artist. Future golden retriever owner.',
        avatar: '/images/avatar_dog.png'
    });

    const [notifs, setNotifs] = useState({
        newFollowers: true,
        postLikes: true,
        mentions: true,
        emailDigest: false,
        pushNotifications: true
    });

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            window.alert('Profile updated successfully!');
        }, 1200);
    };

    const toggleNotif = (key) => {
        setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderProfile = () => (
        <form className="settings-form" onSubmit={handleSaveProfile}>
            <div className="settings-header">
                <h3>My Profile</h3>
                <p>Update your photo and personal details.</p>
            </div>

            <div className="profile-avatar-upload">
                <img src={profile.avatar} alt="Profile" className="avatar-preview" />
                <div className="upload-actions">
                    <button type="button" className="btn-upload">Change Photo</button>
                    <span>JPG or PNG, max 2MB</span>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>First Name</label>
                    <input 
                        type="text" 
                        value={profile.firstName} 
                        onChange={e => setProfile({...profile, firstName: e.target.value})} 
                    />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input 
                        type="text" 
                        value={profile.lastName} 
                        onChange={e => setProfile({...profile, lastName: e.target.value})} 
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                    <input 
                        type="email" 
                        value={profile.email} 
                        onChange={e => setProfile({...profile, email: e.target.value})} 
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Username</label>
                <input 
                    type="text" 
                    value={profile.username} 
                    onChange={e => setProfile({...profile, username: e.target.value})} 
                />
            </div>

            <div className="form-group">
                <label>Bio</label>
                <textarea 
                    value={profile.bio} 
                    onChange={e => setProfile({...profile, bio: e.target.value})}
                    placeholder="Tell the community about yourself..."
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-save" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );

    const renderNotifications = () => (
        <div className="settings-form">
            <div className="settings-header">
                <h3>Notifications</h3>
                <p>Manage how and when you want to receive alerts.</p>
            </div>

            <div className="notification-list">
                <div className="notification-setting">
                    <div className="notif-info">
                        <h4>New Followers</h4>
                        <p>Get notified when someone follows your pet profile.</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={notifs.newFollowers} onChange={() => toggleNotif('newFollowers')} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="notification-setting">
                    <div className="notif-info">
                        <h4>Post Likes</h4>
                        <p>Alert me when someone likes my pet's photos.</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={notifs.postLikes} onChange={() => toggleNotif('postLikes')} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="notification-setting">
                    <div className="notif-info">
                        <h4>Mentions</h4>
                        <p>Get notified when you or your pet are mentioned in a comment.</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={notifs.mentions} onChange={() => toggleNotif('mentions')} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="notification-setting">
                    <div className="notif-info">
                        <h4>Push Notifications</h4>
                        <p>Receive notifications on your browser/mobile device.</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={notifs.pushNotifications} onChange={() => toggleNotif('pushNotifications')} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="notification-setting">
                    <div className="notif-info">
                        <h4>Email Digest</h4>
                        <p>A weekly summary of activity you might have missed.</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={notifs.emailDigest} onChange={() => toggleNotif('emailDigest')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </div>
    );

    const renderSecurity = () => (
        <div className="settings-form">
            <div className="settings-header">
                <h3>Account Security</h3>
                <p>Change your password and secure your account.</p>
            </div>

            <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="••••••••" />
            </div>

            <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Min. 8 characters" />
            </div>

            <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="••••••••" />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-save">Update Password</button>
            </div>

            <div className="settings-header" style={{ marginTop: '40px' }}>
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account.</p>
            </div>
            
            <button type="button" className="btn-upload" style={{ width: 'fit-content' }}>Enable 2FA</button>
        </div>
    );

    return (
        <div className="pawtastic-feed">
            <Sidebar brandText="Pawtastic" />
            
            <main className="main-content">
                <div className="settings-page">
                    <div className="settings-container">
                        <aside className="settings-sidebar">
                            <h2>Settings</h2>
                            <ul className="settings-nav">
                                <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                                    <Icons.User />
                                    My Profile
                                </li>
                                <li className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
                                    <Icons.Lock />
                                    Security
                                </li>
                                <li className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
                                    <Icons.Bell />
                                    Notifications
                                </li>
                                <li className={activeTab === 'privacy' ? 'active' : ''} onClick={() => setActiveTab('privacy')}>
                                    <Icons.Shield />
                                    Privacy
                                </li>
                            </ul>
                        </aside>

                        <section className="settings-content">
                            {activeTab === 'profile' && renderProfile()}
                            {activeTab === 'notifications' && renderNotifications()}
                            {activeTab === 'security' && renderSecurity()}
                            {activeTab === 'privacy' && (
                                <div className="settings-form">
                                    <div className="settings-header">
                                        <h3>Privacy Settings</h3>
                                        <p>Control who can see your profile and posts.</p>
                                    </div>
                                    <div className="notification-setting">
                                        <div className="notif-info">
                                            <h4>Private Profile</h4>
                                            <p>Only people you approve can see your pets and photos.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
