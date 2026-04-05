import React, { useState } from 'react';
import '../../sass/feed.scss';
import Sidebar from './Sidebar';

// SVG Icons
const Icons = {
    Home: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    Message: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    Trophy: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10M5 4h14v4a2 2 0 0 1-2 2h-1M6 10H5a2 2 0 0 1-2-2V4M12 17a5 5 0 0 0 5-5V4"></path></svg>,
    Paw: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Setting: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Logout: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Plus: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>,
    Bell: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    Like: ({ liked }) => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ fill: liked ? "currentColor" : "none", stroke: liked ? "currentColor" : "#BDBDBD" }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Chat: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
    Share: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>,
    Photo: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
    Video: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
    MapPin: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
    Smile: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>,
    Send: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
    Globe: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
    Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    Fire: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>,
    Heart: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Gamepad: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"></path></svg>,
    Dog: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.724 2 2h3a2 2 0 0 0 2-2v-4.828z"></path><path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.08.703-1.725 1.724-2 2h-3a2 2 0 0 1-2-2v-4.828z"></path><path d="M8 14v.5c0 2.21 1.79 4 4 4s4-1.79 4-4V14"></path><path d="M9 10h.01"></path><path d="M15 10h.01"></path></svg>,
    Cat: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7 .58 10a11.95 11.95 0 0 1-18 0c1-3-.82-9.42.58-10C5 2.42 8.25 3.26 10.03 5.26c.65-.17 1.33-.26 2-.26z"></path><circle cx="9" cy="11" r="1"></circle><circle cx="15" cy="11" r="1"></circle><path d="M12 14c-.5 0-1.5.5-1.5 1.5s1 2.5 1.5 2.5 1.5-1.5 1.5-2.5S12.5 14 12 14z"></path></svg>
};

const Feed = () => {
    // JS States for interactions as requested
    const [searchQuery, setSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [activeFeedTab, setActiveFeedTab] = useState('all');

    // Feed interactions state
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(100);
    const [commentsExpanded, setCommentsExpanded] = useState(false);
    const [hoveredSuggestion, setHoveredSuggestion] = useState(null);

    // Handlers
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const toggleLike = () => {
        if (isLiked) {
            setLikesCount(likesCount - 1);
            setIsLiked(false);
        } else {
            setLikesCount(likesCount + 1);
            setIsLiked(true);
        }
    };



    const suggestions = [
        { name: 'Name', breed: 'German Shepherd' },
        { name: 'Name', breed: 'Persian Cat' },
        { name: 'Name', breed: 'Guinea Pig' },
        { name: 'Name', breed: 'Rabbit' }
    ];

    return (
        <div className="pawtastic-feed">
            {/* Reusable Sidebar Component */}
            <Sidebar brandText="Pawtastic" />

            <main className="main-content">
                <header className="top-nav">
                    <div className={`search-bar ${searchActive ? 'active' : ''}`}>
                        <span className="search-icon"><Icons.Search /></span>
                        <input
                            type="text"
                            placeholder="Search pets ...."
                            value={searchQuery}
                            onChange={handleSearch}
                            onFocus={() => setSearchActive(true)}
                            onBlur={() => setSearchActive(false)}
                        />
                    </div>
                    <div className="header-actions">
                        <button className="icon-btn" title="Create Post" onClick={() => setCreateModalOpen(true)}><Icons.Plus /></button>
                        <button className="icon-btn" title="Notifications"><Icons.Bell /></button>
                        <img src="" alt="User" className="user-avatar" />
                    </div>
                </header>

                <div className="feed-layout">
                    {/* Center Column */}
                    <div className="feed-column">
                        <div className="feed-tabs-new">
                            <button className={`pill-tab ${activeFeedTab === 'all' ? 'active' : ''}`} onClick={() => setActiveFeedTab('all')}>
                                <Icons.Gamepad /> All
                            </button>
                            <button className={`pill-tab ${activeFeedTab === 'following' ? 'active' : ''}`} onClick={() => setActiveFeedTab('following')}>
                                <Icons.Heart /> Following
                            </button>
                            <button className={`pill-tab ${activeFeedTab === 'dogs' ? 'active' : ''}`} onClick={() => setActiveFeedTab('dogs')}>
                                <Icons.Dog /> Dogs
                            </button>
                            <button className={`pill-tab ${activeFeedTab === 'cats' ? 'active' : ''}`} onClick={() => setActiveFeedTab('cats')}>
                                <Icons.Cat /> Cats
                            </button>
                            <button className={`pill-tab ${activeFeedTab === 'trending' ? 'active' : ''}`} onClick={() => setActiveFeedTab('trending')}>
                                Trending
                            </button>
                        </div>

                        <div className="post-card">
                            <div className="post-header">
                                <img src="/images/avatar_dog.png" alt="Author" className="post-author-img" />
                                <div className="post-author-info">
                                    <span className="author-name">Oreo</span>
                                    <span className="post-time">1h ago</span>
                                </div>
                                <button className="more-btn">•••</button>
                            </div>
                            <img src="/images/feed1.png" alt="Post content" className="post-image" />
                            <div className="post-actions">
                                <button onClick={toggleLike} className={isLiked ? 'liked' : ''}>
                                    <Icons.Like liked={isLiked} /> {likesCount}
                                </button>
                                <button onClick={() => setCommentsExpanded(!commentsExpanded)}>
                                    <Icons.Chat /> 20
                                </button>
                                <button><Icons.Share /></button>
                            </div>
                            {commentsExpanded && (
                                <div className="comment-section">
                                    <input type="text" className="comment-input" placeholder="Write a comment about this post..." autoFocus />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="side-column">
                        <div className="side-card trending-card">
                            <h4>TRENDING NOW</h4>
                            <ul>
                                <li><strong>#ParkDay</strong> <span>24.5k Posts</span></li>
                                <li><strong>#MeowMonday</strong> <span>18.2k Posts</span></li>
                                <li><strong>#GoldenHour</strong> <span>12.9k Posts</span></li>
                            </ul>
                        </div>

                        <div className="side-card suggested-card">
                            <h4>SUGGESTED FOR YOU</h4>
                            <ul>
                                {suggestions.map((s, i) => (
                                    <li
                                        key={i}
                                        className={hoveredSuggestion === i ? 'hovered' : ''}
                                        onMouseEnter={() => setHoveredSuggestion(i)}
                                        onMouseLeave={() => setHoveredSuggestion(null)}
                                    >
                                        <div className="suggested-avatar" style={{ backgroundImage: 'url(/images/avatar_dog.png)' }}></div>
                                        <div className="suggested-info">
                                            <span className="name">{s.name}</span>
                                            <span className="breed">{s.breed}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Post Modal Overlay */}
            {isCreateModalOpen && (
                <div className="story-modal-overlay" onClick={() => setCreateModalOpen(false)}>
                    <div className="create-post-modal" onClick={e => e.stopPropagation()}>
                        <div className="create-post-card" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                            <div className="create-post-top">
                                <div className="avatar-circle">MP</div>
                                <input type="text" placeholder="What's your pet up to today?" className="create-post-input" autoFocus />
                            </div>
                            <div className="create-post-divider"></div>
                            <div className="create-post-bottom">
                                <div className="create-actions">
                                    <button className="action-btn"><Icons.Photo /> Photo</button>
                                    <button className="action-btn"><Icons.Video /> Video</button>
                                    <button className="action-btn"><Icons.MapPin /> Playdate</button>
                                    <button className="action-btn"><Icons.Smile /></button>
                                </div>
                                <button className="post-submit-btn" onClick={() => setCreateModalOpen(false)}><Icons.Send /> Post</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Feed;
