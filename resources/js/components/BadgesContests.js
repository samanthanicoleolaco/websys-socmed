import React, { useState } from 'react';
import '../../sass/feed.scss';
import '../../sass/badges.scss';
import Sidebar from './Sidebar';

// Reusing existing SVGs and adding missing ones for Badges UI
const Icons = {
    Home: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    MessageCircle: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    Heart: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Fire: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>,
    Award: ({ size=18, color="currentColor", style={} }) => <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10M5 4h14v4a2 2 0 0 1-2 2h-1M6 10H5a2 2 0 0 1-2-2V4M12 17a5 5 0 0 0 5-5V4"></path></svg>,
    Settings: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    LogOut: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    Users: ({ size=14 }) => <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    Camera: ({ size=14 }) => <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
    Clock: ({ size=12 }) => <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    ChevronRight: ({ size=14 }) => <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>,
    TrendingUp: ({ size=18, color="currentColor" }) => <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
    Star: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
    Sunrise: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline></svg>,
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Plus: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>,
    Bell: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    ImagePlaceholder: () => <svg width="48" height="48" fill="none" stroke="#c5cad3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M21 15l-5-5L5 21"></path></svg>,
    Crown: ({ size = 18, color = '#FBBF24' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
            <path d="M5 21h14" />
        </svg>
    )
};

const BadgesContests = () => {
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);

    const badges = [
        { id: 1, title: 'Early Bird', date: 'Jan 12, 2024', icon: <Icons.Fire />, unlocked: true },
        { id: 2, title: 'Chatterbox', date: 'Feb 05, 2024', icon: <Icons.MessageCircle />, unlocked: true },
        { id: 3, title: 'Popular Pup', date: 'Mar 20, 2024', icon: <Icons.Heart />, unlocked: true },
        { id: 4, title: 'Contest King', date: 'Locked', icon: <Icons.Award />, unlocked: false },
        { id: 5, title: 'Social Star', date: 'Locked', icon: <Icons.Star />, unlocked: false },
        { id: 6, title: 'Top Poster', date: 'Locked', icon: <Icons.TrendingUp />, unlocked: false },
    ];

    const hallOfFame = [
        { id: 1, name: 'Buddy', subtitle: 'Tongue Out Tuesday', photo: '/images/avatar_dog.png' },
        { id: 2, name: 'Molly', subtitle: 'Best Beach Day', photo: '/images/avatar_dog.png' },
        { id: 3, name: 'Oliver', subtitle: 'Grumpy Faces', photo: '/images/avatar_dog.png' },
        { id: 4, name: 'Nala', subtitle: 'Snow Fun', photo: '/images/avatar_dog.png' }
    ];

    const contests = [
        { id: 1, title: 'Cutest Sleepy Face', desc: 'Catch your pet in their most adorable slumbering pose! Bonus points for funny sleeping positions and cozy blankets.', competing: '1,245', timeLeft: '2d 14h left', award: 'Golden Bone Trophy' },
        { id: 2, title: 'Action Shot Champions', desc: 'The best mid air, mid run, or mid jump photos of your active furballs.', competing: '890', timeLeft: '5d 08h left', award: 'Hi-Flier Pro Badge' },
        { id: 3, title: 'Best Outfit 2024', desc: 'Dressed to impress! Show off your pet\'s wardrobe from cozy sweaters to fancy ties.', competing: '3,420', timeLeft: '12h 45m left', award: 'Style Icon Award' }
    ];

    const leaderboard = [
        { rank: 1, name: 'Maximus Prime', points: '15,400 pts', medal: '#FBBF24' },
        { rank: 2, name: 'Bella Bear', points: '14,200 pts', medal: '#9CA3AF' },
        { rank: 3, name: 'Cooper the Great', points: '12,100 pts', medal: '#B45309' },
        { rank: 4, name: 'Luna the Husky', points: '8,400 pts', isSelf: true },
        { rank: 5, name: 'Charlie Bark', points: '8,100 pts' },
        { rank: 6, name: 'Daisy Mae', points: '7,900 pts' },
        { rank: 7, name: 'Rocky Bal-Bark', points: '7,200 pts' }
    ];

    return (
        <div className="pawtastic-feed">
            <Sidebar brandText="Pawtastic" />

            <main className="main-content">
                <header className="top-nav">
                    <div className={`search-bar ${searchActive ? 'active' : ''}`}>
                        <span className="search-icon"><Icons.Search /></span>
                        <input
                            type="text"
                            placeholder="Search pets ...."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchActive(true)}
                            onBlur={() => setSearchActive(false)}
                        />
                    </div>
                    <div className="header-actions">
                        <button type="button" className="icon-btn" title="Create Post"><Icons.Plus /></button>
                        <button type="button" className="icon-btn" title="Notifications"><Icons.Bell /></button>
                        <img src="/images/avatar_dog.png" alt="" className="user-avatar" />
                    </div>
                </header>

                <div className="badges-contests-scroll">
                    <div className="badges-contests-page">
                {/* Badges & Achievements Section */}
                <div className="bc-section badges-overview">
                    <div className="section-header">
                        <h2>Badges & Achievements</h2>
                        <span className="unlocked-text">3 / 15 Unlocked</span>
                    </div>

                    <div className="badges-row-wrapper">
                        <div className="badges-list">
                            {badges.map(b => (
                                <div key={b.id} className={`badge-item ${b.unlocked ? 'unlocked' : 'locked'}`}>
                                    <div className="icon-circle">
                                        {b.icon}
                                    </div>
                                    <h5>{b.title}</h5>
                                    <p>{b.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hall-of-fame-section">
                        <h4><Icons.Award size={18} color="#FBBF24" style={{marginRight: '6px'}} /> Hall of Fame</h4>
                        <div className="famers-list">
                            {hallOfFame.map(f => (
                                <div key={f.id} className="famer-card">
                                    <div className="famer-avatar" style={{ backgroundImage: `url(${f.photo})` }} role="img" aria-label={f.name} />
                                    <div className="famer-info">
                                        <h6>{f.name}</h6>
                                        <p>{f.subtitle}</p>
                                        <span className="champion-badge">CHAMPION</span>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="see-all-arrow">
                                <span>SEE ALL</span>
                                <Icons.ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bc-two-columns">
                    {/* Left Column: Contests */}
                    <div className="contests-column">
                        <div className="section-header contests-header">
                            <div>
                                <h2>Achievements & Contests</h2>
                                <p>Climb the ranks, win awards, and show off your pet&apos;s pawesome personality.</p>
                            </div>
                        </div>

                        <div className="tabs-row">
                            <div className="tabs">
                                <button type="button" className={activeTab === 'active' ? 'active' : ''} onClick={() => setActiveTab('active')}>Active Contests</button>
                                <button type="button" className={activeTab === 'upcoming' ? 'active' : ''} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
                            </div>
                            <button type="button" className="view-history">View History <Icons.ChevronRight size={14}/></button>
                        </div>

                        <div className="contests-grid">
                            {contests.map(c => (
                                <div key={c.id} className="contest-card">
                                    <div className="contest-image-box">
                                        <div className="image-placeholder contest-placeholder">
                                            <Icons.ImagePlaceholder />
                                        </div>
                                        <div className="time-pill"><Icons.Clock size={12}/> {c.timeLeft}</div>
                                        <div className="award-pill">{c.award}</div>
                                    </div>
                                    <div className="contest-content">
                                        <h5>{c.title}</h5>
                                        <p className="desc">{c.desc}</p>
                                        <p className="competing"><Icons.Users size={14}/> {c.competing} pets competing</p>
                                        <button type="button" className="submit-entry-btn"><Icons.Camera size={14}/> Submit Entry</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Leaderboard */}
                    <div className="leaderboard-column">
                        <h2>Leaderboard</h2>
                        <div className="leaderboard-header">
                            <div className="title-left"><Icons.TrendingUp size={16} color="#FAB364"/> Top Pets</div>
                            <div className="global-weekly-pill">Global Weekly</div>
                        </div>

                        <div className="leaderboard-list">
                            {leaderboard.map(u => (
                                <div key={u.rank} className={`board-item ${u.isSelf ? 'self-highlight' : ''}`}>
                                    <div className="rank">
                                        {u.rank === 1 ? (
                                            <Icons.Crown size={20} color="#FBBF24" />
                                        ) : [2, 3].includes(u.rank) ? (
                                            <Icons.Award size={18} color={u.medal} />
                                        ) : (
                                            <span className="rank-num">{u.rank}</span>
                                        )}
                                    </div>
                                    <div className="board-avatar" style={{ backgroundImage: 'url(/images/avatar_dog.png)' }} role="img" aria-label="" />
                                    <div className="board-info">
                                        <h6 style={{ color: u.isSelf ? '#A44200' : '#222' }}>{u.name}</h6>
                                        <p>{u.points}</p>
                                    </div>
                                    <div className="medal-icon-right">
                                        {u.rank === 1 ? (
                                            <Icons.Crown size={16} color="#FBBF24" />
                                        ) : (
                                            <Icons.Award size={16} color={u.medal || '#C4C4C4'} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="full-standings-btn">View Full Standings</button>
                    </div>
                </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default BadgesContests;
