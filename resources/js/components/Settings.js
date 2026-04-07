import React, { useState, useRef } from 'react';
import Sidebar from './Sidebar';

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = {
    User:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    Lock:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    Bell:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    Shield:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Help:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    Camera:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    Eye:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    EyeOff:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    Check:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    Chevron: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
    Logout:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Link:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    Trash:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
};

// ── Toggle Switch ──────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`st-toggle ${checked ? 'st-toggle--on' : ''}`}
    >
        <span className="st-toggle__thumb" />
    </button>
);

// ── Password Input ─────────────────────────────────────────────────────────
const PasswordInput = ({ placeholder, value, onChange }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="st-input-wrap">
            <input
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="st-input"
            />
            <button type="button" className="st-input-icon" onClick={() => setShow(s => !s)}>
                {show ? <Icon.EyeOff /> : <Icon.Eye />}
            </button>
        </div>
    );
};

// ── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ message, type = 'success' }) => (
    <div className={`st-toast st-toast--${type}`}>
        {type === 'success' && <span className="st-toast__icon"><Icon.Check /></span>}
        {message}
    </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving]       = useState(false);
    const [toast, setToast]         = useState(null);
    const fileRef                   = useRef();

    const [profile, setProfile] = useState({
        name: 'Sam Virtudazo',
        username: 'sam_virtudazo',
        email: 'sam@example.com',
        bio: 'Pet lover 🐾 Digital artist. Future golden retriever owner.',
        website: '',
        phone: '',
        gender: '',
        avatar: '/images/avatar_dog.png',
    });

    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

    const [notifs, setNotifs] = useState({
        likes: true, comments: true, followers: true,
        mentions: true, messages: true, email: false, push: true,
    });

    const [privacy, setPrivacy] = useState({
        privateAccount: false, activityStatus: true,
        allowTags: true, allowMentions: true,
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const save = (e) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => { setSaving(false); showToast('Changes saved successfully.'); }, 1000);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setProfile(p => ({ ...p, avatar: url }));
        }
    };

    // ── Tabs config ──────────────────────────────────────────────────────
    const tabs = [
        { id: 'profile',       label: 'Edit Profile',     Icon: Icon.User   },
        { id: 'security',      label: 'Password',         Icon: Icon.Lock   },
        { id: 'notifications', label: 'Notifications',    Icon: Icon.Bell   },
        { id: 'privacy',       label: 'Privacy',          Icon: Icon.Shield },
        { id: 'help',          label: 'Help & Support',   Icon: Icon.Help   },
    ];

    // ── Render: Profile ──────────────────────────────────────────────────
    const renderProfile = () => (
        <form onSubmit={save}>
            <div className="st-section-title">Edit Profile</div>

            {/* Avatar */}
            <div className="st-avatar-row">
                <div className="st-avatar-wrap">
                    <img src={profile.avatar} alt="avatar" className="st-avatar-img" />
                    <button type="button" className="st-avatar-btn" onClick={() => fileRef.current.click()}>
                        <Icon.Camera />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                </div>
                <div className="st-avatar-meta">
                    <span className="st-avatar-name">{profile.name}</span>
                    <button type="button" className="st-link-btn" onClick={() => fileRef.current.click()}>
                        Change profile photo
                    </button>
                </div>
            </div>

            {/* Fields */}
            <div className="st-field">
                <label className="st-label">Name</label>
                <input className="st-input" value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                <span className="st-hint">Help people discover your account by using the name you're known by.</span>
            </div>

            <div className="st-field">
                <label className="st-label">Username</label>
                <div className="st-input-wrap">
                    <span className="st-input-prefix">@</span>
                    <input className="st-input st-input--prefix" value={profile.username}
                        onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} />
                </div>
            </div>

            <div className="st-field">
                <label className="st-label">Website</label>
                <div className="st-input-wrap">
                    <span className="st-input-icon-left"><Icon.Link /></span>
                    <input className="st-input st-input--icon-left" placeholder="https://" value={profile.website}
                        onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} />
                </div>
            </div>

            <div className="st-field">
                <label className="st-label">Bio</label>
                <textarea className="st-textarea" rows={4} maxLength={150} value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
                <span className="st-hint st-hint--right">{profile.bio.length} / 150</span>
            </div>

            <div className="st-divider-label">Personal information</div>
            <span className="st-hint" style={{ marginBottom: 16, display: 'block' }}>
                This won't be part of your public profile.
            </span>

            <div className="st-field">
                <label className="st-label">Email address</label>
                <div className="st-input-wrap">
                    <input className="st-input" type="email" value={profile.email}
                        onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                    <span className="st-badge st-badge--verified">Verified</span>
                </div>
            </div>

            <div className="st-field">
                <label className="st-label">Phone number</label>
                <input className="st-input" type="tel" placeholder="Add phone number" value={profile.phone}
                    onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>

            <div className="st-field">
                <label className="st-label">Gender</label>
                <select className="st-select" value={profile.gender}
                    onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="custom">Custom</option>
                </select>
            </div>

            <div className="st-form-actions">
                <button type="submit" className="st-btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Submit'}
                </button>
            </div>
        </form>
    );

    // ── Render: Security ─────────────────────────────────────────────────
    const renderSecurity = () => (
        <form onSubmit={save}>
            <div className="st-section-title">Change Password</div>
            <span className="st-hint" style={{ marginBottom: 24, display: 'block' }}>
                Use a strong password that you don't use elsewhere.
            </span>

            <div className="st-field">
                <label className="st-label">Current password</label>
                <PasswordInput placeholder="Current password"
                    value={passwords.current}
                    onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
            </div>
            <div className="st-field">
                <label className="st-label">New password</label>
                <PasswordInput placeholder="New password (min. 8 characters)"
                    value={passwords.next}
                    onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))} />
            </div>
            <div className="st-field">
                <label className="st-label">Confirm new password</label>
                <PasswordInput placeholder="Confirm new password"
                    value={passwords.confirm}
                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
            </div>

            <div className="st-form-actions">
                <button type="submit" className="st-btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Change password'}
                </button>
            </div>

            <div className="st-divider" />
            <div className="st-section-title" style={{ marginTop: 0 }}>Login activity</div>

            {[
                { device: 'Chrome · Windows', loc: 'Manila, Philippines', time: 'Active now', current: true },
                { device: 'Safari · iPhone 15 Pro', loc: 'Manila, Philippines', time: '2 hours ago', current: false },
            ].map((s, i) => (
                <div className="st-session-row" key={i}>
                    <div className="st-session-dot" data-active={s.current} />
                    <div className="st-session-info">
                        <span className="st-session-device">{s.device} {s.current && <span className="st-badge st-badge--current">This device</span>}</span>
                        <span className="st-session-meta">{s.loc} · {s.time}</span>
                    </div>
                    {!s.current && (
                        <button type="button" className="st-btn-ghost-danger">
                            <Icon.Logout /> Log out
                        </button>
                    )}
                </div>
            ))}
        </form>
    );

    // ── Render: Notifications ────────────────────────────────────────────
    const renderNotifications = () => {
        const groups = [
            {
                title: 'Push notifications',
                items: [
                    { id: 'likes',     label: 'Likes',           desc: 'When someone likes your post or photo.' },
                    { id: 'comments',  label: 'Comments',        desc: 'When someone comments on your post.' },
                    { id: 'followers', label: 'New followers',   desc: 'When someone starts following you.' },
                    { id: 'mentions',  label: 'Mentions',        desc: 'When someone mentions you in a comment.' },
                    { id: 'messages',  label: 'Direct messages', desc: 'When you receive a new message.' },
                ],
            },
            {
                title: 'Email notifications',
                items: [
                    { id: 'email', label: 'Weekly digest', desc: 'A summary of activity on your account.' },
                    { id: 'push',  label: 'Browser push',  desc: 'Real-time alerts in your browser.' },
                ],
            },
        ];

        return (
            <div>
                <div className="st-section-title">Notifications</div>
                {groups.map(g => (
                    <div key={g.title} className="st-notif-group">
                        <div className="st-notif-group-title">{g.title}</div>
                        {g.items.map(item => (
                            <div className="st-notif-row" key={item.id}>
                                <div className="st-notif-text">
                                    <span className="st-notif-label">{item.label}</span>
                                    <span className="st-notif-desc">{item.desc}</span>
                                </div>
                                <Toggle checked={notifs[item.id]} onChange={() => setNotifs(n => ({ ...n, [item.id]: !n[item.id] }))} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    // ── Render: Privacy ──────────────────────────────────────────────────
    const renderPrivacy = () => (
        <div>
            <div className="st-section-title">Privacy</div>

            <div className="st-privacy-group">
                <div className="st-privacy-group-title">Account privacy</div>
                <div className="st-notif-row">
                    <div className="st-notif-text">
                        <span className="st-notif-label">Private account</span>
                        <span className="st-notif-desc">
                            When your account is private, only people you approve can see your photos and videos.
                        </span>
                    </div>
                    <Toggle checked={privacy.privateAccount} onChange={() => setPrivacy(p => ({ ...p, privateAccount: !p.privateAccount }))} />
                </div>
            </div>

            <div className="st-privacy-group">
                <div className="st-privacy-group-title">Interactions</div>
                {[
                    { id: 'activityStatus', label: 'Show activity status', desc: 'Allow accounts you follow and anyone you message to see when you were last active.' },
                    { id: 'allowTags',      label: 'Allow tags',           desc: 'Allow people to tag you in their photos and videos.' },
                    { id: 'allowMentions',  label: 'Allow mentions',       desc: 'Control who can @mention you in comments and captions.' },
                ].map(item => (
                    <div className="st-notif-row" key={item.id}>
                        <div className="st-notif-text">
                            <span className="st-notif-label">{item.label}</span>
                            <span className="st-notif-desc">{item.desc}</span>
                        </div>
                        <Toggle checked={privacy[item.id]} onChange={() => setPrivacy(p => ({ ...p, [item.id]: !p[item.id] }))} />
                    </div>
                ))}
            </div>

            <div className="st-divider" />

            <div className="st-danger-zone">
                <div className="st-danger-title">Danger zone</div>
                <div className="st-danger-row">
                    <div>
                        <span className="st-notif-label">Deactivate account</span>
                        <span className="st-notif-desc">Temporarily disable your account.</span>
                    </div>
                    <button type="button" className="st-btn-ghost-danger">Deactivate</button>
                </div>
                <div className="st-danger-row">
                    <div>
                        <span className="st-notif-label">Delete account</span>
                        <span className="st-notif-desc">Permanently delete your account and all data.</span>
                    </div>
                    <button type="button" className="st-btn-danger"><Icon.Trash /> Delete</button>
                </div>
            </div>
        </div>
    );

    // ── Render: Help ─────────────────────────────────────────────────────
    const renderHelp = () => (
        <div>
            <div className="st-section-title">Help & Support</div>
            {[
                { label: 'Help Center',          desc: 'Browse articles and guides.' },
                { label: 'Report a problem',     desc: 'Let us know if something isn\'t working.' },
                { label: 'Privacy Policy',       desc: 'Read how we handle your data.' },
                { label: 'Terms of Service',     desc: 'Review the rules of using Pawtastic.' },
                { label: 'About Pawtastic',      desc: 'Version 1.0.0' },
            ].map(item => (
                <button type="button" className="st-help-row" key={item.label}>
                    <div className="st-notif-text">
                        <span className="st-notif-label">{item.label}</span>
                        <span className="st-notif-desc">{item.desc}</span>
                    </div>
                    <span className="st-help-chevron"><Icon.Chevron /></span>
                </button>
            ))}
        </div>
    );

    const panels = {
        profile:       renderProfile,
        security:      renderSecurity,
        notifications: renderNotifications,
        privacy:       renderPrivacy,
        help:          renderHelp,
    };

    return (
        <div className="pawtastic-feed">
            <Sidebar brandText="Pawtastic" />
            <main className="main-content">
                <div className="st-page">
                    {toast && <Toast message={toast.msg} type={toast.type} />}

                    <div className="st-layout">
                        {/* Sidebar nav */}
                        <aside className="st-nav">
                            <div className="st-nav-title">Settings</div>
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    className={`st-nav-item ${activeTab === t.id ? 'st-nav-item--active' : ''}`}
                                    onClick={() => setActiveTab(t.id)}
                                >
                                    <span className="st-nav-icon"><t.Icon /></span>
                                    <span className="st-nav-label">{t.label}</span>
                                    <span className="st-nav-chevron"><Icon.Chevron /></span>
                                </button>
                            ))}
                        </aside>

                        {/* Content panel */}
                        <section className="st-panel">
                            {panels[activeTab]?.()}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
