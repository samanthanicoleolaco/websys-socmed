import React, { useState, useEffect } from 'react';
import '../../sass/feed.scss';
import Sidebar from './Sidebar';

// SVG Icons
const Icons = {
    Dashboard: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" ry="1"></rect><rect x="14" y="3" width="7" height="7" rx="1" ry="1"></rect><rect x="14" y="14" width="7" height="7" rx="1" ry="1"></rect><rect x="3" y="14" width="7" height="7" rx="1" ry="1"></rect></svg>,
    Posts: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    Chart: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
    Setting: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Logout: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Bell: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
};

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

    const navItems = [
        { id: 'dashboard', icon: <Icons.Dashboard />, text: 'Dashboard', active: activeTab === 'dashboard' },
        { id: 'posts', icon: <Icons.Posts />, text: 'Posts Management', active: activeTab === 'posts' },
        { id: 'reports', icon: <Icons.Chart />, text: 'Reports & Analytics', active: activeTab === 'reports' },
        { id: 'settings', icon: <Icons.Setting />, text: 'System Settings', active: activeTab === 'settings' }
    ];

    const bottomItems = [
        { id: 'logout', icon: <Icons.Logout />, text: 'Log out' }
    ];

    return (
        <div className="pawtastic-feed" style={{ background: '#f5f8fa' }}>
            <Sidebar 
                brandText="Admin" 
                navItems={navItems} 
                bottomItems={bottomItems} 
                onNavClick={(item) => setActiveTab(item.id)}
            />

            <main className="main-content">
                <header className="top-nav">
                    <div className={`search-bar ${searchActive ? 'active' : ''}`}>
                        <span className="search-icon"><Icons.Search /></span>
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
                        <button className="icon-btn"><Icons.Bell /></button>
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
                                                    <td style={{ padding: '15px 10px', borderBottom: '1px solid #f5f5f5' }}>
                                                        <button onClick={(e) => handleDeleteUser(e, user.id)} style={{ background: '#f1416c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Remove User</button>
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

                        {/* System Settings View Placeholder */}
                        {activeTab === 'settings' && (
                            <div className="post-card" style={{ padding: '30px', marginTop: '20px' }}>
                                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px', color: '#333' }}>System Settings</h3>
                                
                                <div style={{ marginBottom: '25px' }}>
                                    <h5 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Maintenance Mode</h5>
                                    <p style={{ color: '#666', fontSize: '13px', margin: '0 0 10px 0' }}>Temporarily disable public access to the Pawtastic platform.</p>
                                    <button style={{ background: '#e4e6ef', color: '#3f4254', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Enable Maintenance</button>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <h5 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Cache Management</h5>
                                    <p style={{ color: '#666', fontSize: '13px', margin: '0 0 10px 0' }}>Clear application cache to force latest content updates.</p>
                                    <button style={{ background: '#ffc26d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Clear Cache</button>
                                </div>

                                <div>
                                    <h5 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Registration</h5>
                                    <p style={{ color: '#666', fontSize: '13px', margin: '0 0 10px 0' }}>Allow new users to create accounts.</p>
                                    <input type="checkbox" defaultChecked id="regToggle" /> <label htmlFor="regToggle" style={{ fontSize: '14px', fontWeight: 'bold' }}>Enabled</label>
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
