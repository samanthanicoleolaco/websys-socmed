import React, { useState, useEffect } from 'react';
import '../../sass/pages/feed.scss';
import Sidebar from './pages/Sidebar';
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
    
    // Admin Data States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ total_users: 0, total_pets: 0, total_posts: 0 });
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [logins, setLogins] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchStats();
            fetchUsers();
        } else if (activeTab === 'posts') {
            fetchPosts();
        } else if (activeTab === 'reports') {
            fetchStats();
            fetchLogins();
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

    const navItems = [
        { id: 'dashboard', icon: <Layout size={20} weight="light" />, text: 'Dashboard', active: activeTab === 'dashboard' },
        { id: 'posts', icon: <Article size={20} weight="light" />, text: 'Posts Management', active: activeTab === 'posts' },
        { id: 'reports', icon: <ChartBar size={20} weight="light" />, text: 'Reports & Analytics', active: activeTab === 'reports' },
        { id: 'settings', icon: <Gear size={20} weight="light" />, text: 'System Settings', active: activeTab === 'settings' }
    ];

    const bottomItems = [
        { id: 'logout', icon: <SignOut size={20} weight="light" />, text: 'Log out' }
    ];

    return (
        <div className="pawtastic-feed" style={{ background: '#f5f8fa' }}>
            <Sidebar 
                brandText="Admin" 
                navItems={navItems} 
                bottomItems={bottomItems} 
                onNavClick={(item) => setActiveTab(item.id)}
            />

            {/* User Edit Modal - Premium UI */}
            {editingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="settings-content" style={{ width: '100%', maxWidth: '800px', minHeight: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
                        <form className="settings-form" onSubmit={handleUpdateUser}>
                            <div className="settings-header">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3>Manage Account</h3>
                                        <p>Adjust privileges and profile details for {editingUser.name}.</p>
                                    </div>
                                    <button type="button" onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748B' }}>&times;</button>
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
                                    <select defaultValue="active">
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

            <main className="main-content">
                <header className="top-nav">
                    <div className={`search-bar ${searchActive ? 'active' : ''}`}>
                        <span className="search-icon"><MagnifyingGlass size={20} weight="light" /></span>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchActive(true)}
                            onBlur={() => setSearchActive(false)}
                        />
                    </div>
                    <div className="header-actions">
                        <button className="icon-btn"><Bell size={22} weight="light" /></button>
                        <span style={{ fontWeight: 600, color: '#ffc26d', marginLeft: '10px' }}>System Admin</span>
                    </div>
                </header>

                <div className="feed-layout">
                    <div className="feed-column" style={{ width: '100%', margin: '0 20px' }}>

                        {/* Dashboard View: Stats & Users */}
                        {activeTab === 'dashboard' && (
                            <>
                                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                    <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                        <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase' }}>Total Active Users</h4>
                                        <h2 style={{ margin: 0, fontSize: '28px', color: '#ffb347' }}>{stats.total_users}</h2>
                                    </div>
                                    <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                        <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase' }}>Total Registered Pets</h4>
                                        <h2 style={{ margin: 0, fontSize: '28px', color: '#ffb347' }}>{stats.total_pets}</h2>
                                    </div>
                                    <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                        <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase' }}>Global Posts Created</h4>
                                        <h2 style={{ margin: 0, fontSize: '28px', color: '#ffb347' }}>{stats.total_posts}</h2>
                                    </div>
                                </div>

                                <div className="post-card" style={{ padding: '20px', marginTop: '20px' }}>
                                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', color: '#333' }}>Platform Accounts</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Name</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Email</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Pets</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Joined</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id}>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', fontWeight: '500' }}>{user.name} {user.is_admin ? <span style={{ color: '#50cd89', fontSize: '10px', fontWeight: 'bold' }}>[ADMIN]</span> : ''}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', color: '#666' }}>{user.email}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', color: '#666' }}>{user.pets_count}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', color: '#666' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => setEditingUser(user)} style={{ background: '#334155', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Edit</button>
                                                        <button onClick={(e) => handleDeleteUser(e, user.id)} style={{ background: '#f1416c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && <tr><td colSpan="5" style={{ padding: '15px 10px' }}>No users found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Reports View: Login Audit */}
                        {activeTab === 'reports' && (
                            <>
                                <div className="post-card" style={{ padding: '20px', marginTop: '20px' }}>
                                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', color: '#333' }}>Recent Login Activity Logs</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Event Time</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>User</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>IP Address</th>
                                                <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Browser Agent</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logins.map(log => (
                                                <tr key={log.id}>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', color: '#555' }}>{new Date(log.login_at).toLocaleString()}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', fontWeight: '500' }}>{log.user?.name || `User ID ` + log.user_id}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', color: '#666' }}>{log.ip_address}</td>
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', color: '#888', fontSize: '11px' }}>{log.user_agent}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Posts Management View */}
                        {activeTab === 'posts' && (
                            <div className="post-card" style={{ padding: '20px', marginTop: '20px' }}>
                                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', color: '#333' }}>Global Posts Registry</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Post ID</th>
                                            <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Author Pet</th>
                                            <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Content Snippet</th>
                                            <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Created On</th>
                                            <th style={{ padding: '10px', borderBottom: '2px solid #eee', color: '#888' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map(post => (
                                            <tr key={post.id}>
                                                <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', color: '#666' }}>#{post.id}</td>
                                                <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', fontWeight: '600', color: '#ffc26d' }}>{post.pet?.name || 'Unknown'}</td>
                                                <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', color: '#555' }}>{post.content ? post.content.substring(0, 40) + '...' : '(Media Post)'}</td>
                                                <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5', color: '#888' }}>{new Date(post.created_at).toLocaleDateString()}</td>
                                                <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5' }}>
                                                    <button onClick={(e) => handleDeletePost(e, post.id)} style={{ background: '#f1416c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Delete Post</button>
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
                                <div className="settings-header" style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>System Configuration</h3>
                                    <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '4px' }}>Global settings for the Petverse platform.</p>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="post-card" style={{ padding: '24px', margin: 0, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ padding: '10px', background: '#FEE2E2', borderRadius: '10px', color: '#EF4444' }}>
                                                <Lock size={20} weight="fill" />
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#334155' }}>Maintenance Mode</h4>
                                        </div>
                                        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
                                            Temporarily disable public access. Useful for deployments or critical fixes.
                                        </p>
                                        <button style={{ background: '#F8FAFC', color: '#334155', border: '1.5px solid #E2E8F0', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            Activate Maintenance
                                        </button>
                                    </div>

                                    <div className="post-card" style={{ padding: '24px', margin: 0, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ padding: '10px', background: '#FFF7ED', borderRadius: '10px', color: '#F59E0B' }}>
                                                <ChartBar size={20} weight="fill" />
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#334155' }}>Cache Optimization</h4>
                                        </div>
                                        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
                                            Refresh application cache to ensure all users see the latest content updates.
                                        </p>
                                        <button style={{ background: '#ffc26d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(255, 194, 109, 0.2)' }}>
                                            Purge All Cache
                                        </button>
                                    </div>
                                </div>

                                <div className="post-card" style={{ padding: '24px', marginTop: '24px', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '700', color: '#1E293B' }}>Access & Registration</h4>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
                                        <div>
                                            <h5 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>User Registration</h5>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Control whether new pet owners can join the platform.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
                                        <div>
                                            <h5 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>Email Verification</h5>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Require all new signups to verify their email address.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    <div style={{ padding: '20px 0 0 0', textAlign: 'right' }}>
                                        <button style={{ background: '#1E293B', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Apply Global Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
