import React, { useState, useEffect } from 'react';
import '../../sass/pages/admin.scss';
import AdminSidebar from './AdminSidebar';
import { 
    Layout, 
    Article, 
    ChartBar, 
    Gear, 
    SignOut, 
    MagnifyingGlass, 
    Bell,
    Lock
} from 'phosphor-react';

const AdminDashboard = () => {
    // Layout UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const [maintenanceOn, setMaintenanceOn] = useState(false);
    
    // Admin Data States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ total_users: 0, total_pets: 0, total_posts: 0 });
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [logins, setLogins] = useState([]);
    const [signupData, setSignupData] = useState([]);
    const [registrationEnabled, setRegistrationEnabled] = useState(true);
    const [emailVerification, setEmailVerification] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingPost, setViewingPost] = useState(null);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchStats();
            fetchUsers();
        } else if (activeTab === 'posts') {
            fetchPosts();
        } else if (activeTab === 'reports') {
            fetchStats();
            fetchLogins();
            fetchSignupAnalytics();
        } else if (activeTab === 'settings') {
            fetchSettings();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await window.axios.get('/api/admin/stats');
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await window.axios.get('/api/admin/users');
            setUsers(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchPosts = async () => {
        try {
            const res = await window.axios.get('/api/admin/posts');
            setPosts(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchLogins = async () => {
        try {
            const res = await window.axios.get('/api/admin/recent-logins');
            setLogins(res.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchSignupAnalytics = async () => {
        try {
            const res = await window.axios.get('/api/admin/analytics/signups');
            setSignupData(res.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchSettings = async () => {
        try {
            const res = await window.axios.get('/api/admin/settings');
            setRegistrationEnabled(!!res.data.registration_enabled);
            setEmailVerification(!!res.data.email_verification);
        } catch (err) { console.error(err); }
    };

    const handleSaveSettings = async () => {
        try {
            await window.axios.post('/api/admin/settings', {
                registration_enabled: registrationEnabled,
                email_verification: emailVerification
            });
            window.alert('Settings applied successfully!');
        } catch (err) {
            console.error(err);
            window.alert('Failed to save settings.');
        }
    };

    const handleDeleteUser = async (e, id) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await window.axios.delete(`/api/admin/users/${id}`);
            fetchUsers();
        } catch (err) { console.error(err); }
    };

    const handleDeletePost = async (e, id) => {
        e.preventDefault();
        if (!window.confirm('Delete this post permanently?')) return;
        try {
            await window.axios.delete(`/api/admin/posts/${id}`);
            fetchPosts();
        } catch (err) { console.error(err); }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await window.axios.put(`/api/admin/users/${editingUser.id}`, editingUser);
            setEditingUser(null);
            fetchUsers();
            window.alert('User account synchronized successfully!');
        } catch (err) { console.error(err); }
    };

    const toggleMaintenance = async () => {
        const next = !maintenanceOn;
        if (!window.confirm(next ? 'Enable maintenance mode? Public users will see a 503 page.' : 'Disable maintenance mode?')) return;
        try {
            await window.axios.post('/api/admin/maintenance', { enable: next });
            setMaintenanceOn(next);
            window.alert(next ? 'Maintenance mode is ON.' : 'Maintenance mode is OFF.');
        } catch (err) {
            console.error(err);
            window.alert('Failed to toggle maintenance mode.');
        }
    };

    const purgeCache = async () => {
        if (!window.confirm('Purge all caches now?')) return;
        try {
            await window.axios.post('/api/admin/cache/purge');
            window.alert('All caches purged.');
        } catch (err) {
            console.error(err);
            window.alert('Failed to purge caches.');
        }
    };

    return (
        <div className="admin-shell">
            <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* User Edit Modal - Premium UI */}
            {editingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="settings-content" style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', width: 'min(760px, 96vw)', minHeight: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
                        <form className="settings-form" onSubmit={handleUpdateUser}>
                            <div className="settings-header">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3>Manage Account</h3>
                                        <p>Adjust privileges and profile details for {editingUser.name}.</p>
                                    </div>
                                    <button type="button" onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Account Role</label>
                                    <select value={editingUser.is_admin ? 'admin' : 'user'} onChange={e => setEditingUser({...editingUser, is_admin: e.target.value === 'admin'})}>
                                        <option value="user">Regular User</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Account Status</label>
                                    <select value={editingUser.is_banned ? 'suspended' : 'active'} onChange={e => setEditingUser({...editingUser, is_banned: e.target.value === 'suspended'})}>
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="pending">Pending Verification</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                                <button type="submit" className="btn-save">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Post View Modal */}
            {viewingPost && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="settings-content" style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', width: 'min(700px, 96vw)', minHeight: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="settings-header" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3>View Post</h3>
                                    <p>Post by {viewingPost.pet?.name || 'Unknown'}</p>
                                </div>
                                <button type="button" onClick={() => setViewingPost(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
                            </div>
                        </div>
                        
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                            {viewingPost.image_url && (
                                <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', maxHeight: '400px', display: 'flex', justifyContent: 'center', background: '#000' }}>
                                    <img src={viewingPost.image_url} alt="Post" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                                </div>
                            )}
                            {viewingPost.video_url && (
                                <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', background: '#000' }}>
                                    <video src={viewingPost.video_url} controls style={{ maxWidth: '100%', maxHeight: '400px' }} />
                                </div>
                            )}
                            
                            <div style={{ background: 'var(--bg-page)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Post Content</h4>
                                <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.5' }}>{viewingPost.caption || '(No text content)'}</p>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ background: 'var(--bg-page)', padding: '12px', borderRadius: '8px' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Author</p>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--text-main)' }}>{viewingPost.pet?.name || 'Unknown'}</p>
                                </div>
                                <div style={{ background: 'var(--bg-page)', padding: '12px', borderRadius: '8px' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Created</p>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--text-main)' }}>{new Date(viewingPost.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button onClick={() => setViewingPost(null)} style={{ background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                                <button onClick={() => { handleDeletePost(new Event('click'), viewingPost.id); setViewingPost(null); }} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Delete Post</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="admin-content">

                        {/* Dashboard View: Stats & Users */}
                        {activeTab === 'dashboard' && (
                            <>
                                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                    <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                        <h4 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase' }}>Total Active Users</h4>
                                        <h2 style={{ margin: 0, fontSize: '28px', color: 'var(--primary-action)' }}>{stats.total_users}</h2>
                                    </div>
                                    <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                        <h4 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase' }}>Total Registered Pets</h4>
                                        <h2 style={{ margin: 0, fontSize: '28px', color: 'var(--primary-action)' }}>{stats.total_pets}</h2>
                                    </div>
                                    <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                        <h4 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase' }}>Global Posts Created</h4>
                                        <h2 style={{ margin: 0, fontSize: '28px', color: 'var(--primary-action)' }}>{stats.total_posts}</h2>
                                    </div>
                                </div>

                                <div className="post-card" style={{ padding: '20px', marginTop: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px', color: 'var(--text-main)' }}>Platform Accounts</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Name</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Email</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Pets</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Joined</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users
    .filter(u => !searchQuery || u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(user => (
                                                <tr key={user.id}>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-main)' }}>{user.name} {user.is_admin ? <span style={{ color: 'var(--success)', fontSize: '10px', fontWeight: 'bold' }}>[ADMIN]</span> : ''}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{user.email}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{user.pets_count}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => setEditingUser(user)} style={{ background: 'var(--primary-action)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Edit</button>
                                                        <button onClick={(e) => handleDeleteUser(e, user.id)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && <tr><td colSpan="5" style={{ padding: '15px 10px' }}>No users found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Reports View: Platform Analytics */}
                        {activeTab === 'reports' && (
                            <>
                                <div className="post-card" style={{ padding: '20px', marginTop: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px', color: 'var(--text-main)' }}>Platform Analytics</h3>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                                        <div style={{ background: 'var(--bg-page)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Users</p>
                                            <h4 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--primary-action)', fontWeight: 'bold' }}>{stats.total_users || 0}</h4>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--success)' }}>↑ 12% this month</p>
                                        </div>
                                        <div style={{ background: 'var(--bg-page)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Registered Pets</p>
                                            <h4 style={{ margin: 0, fontSize: '1.8rem', color: '#f7b125', fontWeight: 'bold' }}>{stats.total_pets || 0}</h4>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--success)' }}>↑ 8% this month</p>
                                        </div>
                                        <div style={{ background: 'var(--bg-page)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Posts</p>
                                            <h4 style={{ margin: 0, fontSize: '1.8rem', color: '#e91e8c', fontWeight: 'bold' }}>{stats.total_posts || 0}</h4>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--success)' }}>↑ 24% this week</p>
                                        </div>
                                    </div>
                                    
                                    <div style={{ background: 'var(--bg-page)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                                        <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-main)' }}>User Growth Chart</h4>
                                        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', justifyContent: 'space-around' }}>
                                            {(() => {
                                                const maxSignup = Math.max(...signupData.map(d => d.count), 1);
                                                const bars = signupData.length > 0 ? signupData.slice(-12) : Array(12).fill({ count: 0, date: '' });
                                                return bars.map((item, i) => {
                                                    const h = (item.count / maxSignup) * 100 || 5;
                                                    return (
                                                        <div key={i} title={item.date ? `${item.date}: ${item.count} signups` : 'No data'} style={{ width: '8%', height: h + '%', background: 'linear-gradient(135deg, #f7a821, #e91e8c)', borderRadius: '4px', opacity: 0.7 + (i / 20) }}></div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                        <p style={{ margin: '12px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>Last 12 months activity</p>
                                    </div>
                                    
                                    <div style={{ background: 'var(--bg-page)', padding: '16px', borderRadius: '8px' }}>
                                        <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-main)' }}>Recent Login Activity</h4>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>User</th>
                                                    <th style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Time</th>
                                                    <th style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>IP Address</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {logins.slice(0, 5).map(log => (
                                                    <tr key={log.id}>
                                                        <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)' }}>{log.user?.name || 'User ' + log.user_id}</td>
                                                        <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{new Date(log.login_at).toLocaleString()}</td>
                                                        <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{log.ip_address}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Posts Management View */}
                        {activeTab === 'posts' && (
                            <div className="post-card" style={{ padding: '20px', marginTop: '20px' }}>
                                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px', color: 'var(--text-main)' }}>Global Posts Registry</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Post ID</th>
                                            <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Author Pet</th>
                                            <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Content Snippet</th>
                                            <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Created On</th>
                                            <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts
    .filter(p => !searchQuery || p.pet?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.caption?.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(post => (
                                            <tr key={post.id}>
                                                <td style={{ padding: '15px 10px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>#{post.id}</td>
                                                <td style={{ padding: '15px 10px', borderBottom: '1px solid var(--border-color)', fontWeight: '600', color: 'var(--primary-action)' }}>{post.pet?.name || 'Unknown'}</td>
                                                <td style={{ padding: '15px 10px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)' }}>{post.caption ? post.caption.substring(0, 40) + '...' : '(Media Post)'}</td>
                                                <td style={{ padding: '15px 10px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleDateString()}</td>
                                                <td style={{ padding: '15px 10px', borderBottom: '1px solid var(--border-color)' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => setViewingPost(post)} style={{ background: 'var(--primary-action)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>View</button>
                                                        <button onClick={(e) => handleDeletePost(e, post.id)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {posts.length === 0 && <tr><td colSpan="5" style={{ padding: '15px 10px' }}>No posts found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* System Settings View - Professional Redesign */}
                        {activeTab === 'settings' && (
                            <div className="settings-form" style={{ animation: 'slideUp 0.4s ease-out' }}>
                                <div className="settings-header" style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>System Configuration</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>Global settings for the Petverse platform.</p>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="post-card" style={{ padding: '24px', margin: 0, border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ padding: '10px', background: 'rgba(var(--danger-rgb), 0.12)', borderRadius: '10px', color: 'var(--danger)' }}>
                                                <Lock size={20} weight="fill" />
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Maintenance Mode</h4>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
                                            Temporarily disable public access. Useful for deployments or critical fixes.
                                        </p>
                                        <button onClick={toggleMaintenance} style={{ background: 'var(--bg-page)', color: 'var(--text-main)', border: '1.5px solid var(--border-color)', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            {maintenanceOn ? 'Deactivate Maintenance' : 'Activate Maintenance'}
                                        </button>
                                    </div>

                                    <div className="post-card" style={{ padding: '24px', margin: 0, border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ padding: '10px', background: 'rgba(var(--warning-rgb), 0.12)', borderRadius: '10px', color: 'var(--warning)' }}>
                                                <ChartBar size={20} weight="fill" />
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Cache Optimization</h4>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
                                            Refresh application cache to ensure all users see the latest content updates.
                                        </p>
                                        <button onClick={purgeCache} style={{ background: 'var(--primary-action)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(var(--primary-action-rgb), 0.2)' }}>
                                            Purge All Cache
                                        </button>
                                    </div>
                                </div>

                                <div className="post-card" style={{ padding: '24px', marginTop: '24px', border: '1px solid var(--border-color)' }}>
                                    <h4 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Access & Registration</h4>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <div>
                                            <h5 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>User Registration</h5>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Control whether new pet owners can join the platform.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" checked={registrationEnabled} onChange={e => setRegistrationEnabled(e.target.checked)} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <div>
                                            <h5 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>Email Verification</h5>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Require all new signups to verify their email address.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" checked={emailVerification} onChange={e => setEmailVerification(e.target.checked)} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    <div style={{ padding: '20px 0 0 0', textAlign: 'right' }}>
                                        <button onClick={handleSaveSettings} style={{ background: 'var(--text-main)', color: 'var(--bg-card)', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Apply Global Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}

            </main>
        </div>
    );
};

export default AdminDashboard;
