import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Star, 
    Heart, 
    Trophy, 
    PawPrint, 
    Crown, 
    Lightning, 
    Medal, 
    Smiley, 
    Camera, 
    Fire, 
    Users, 
    Sparkle,
    CheckCircle,
    LockKey,
    TrendUp,
    X,
    Image as ImageIcon,
    Plus,
    CloudArrowUp
} from "@phosphor-icons/react";
import Sidebar from './Sidebar';
import "../../../sass/pages/badges.scss";

const iconMap = {
    Star, Heart, Trophy, PawPrint, Crown, Lightning, Medal, Smiley, Camera, Fire, Users, Sparkle,
};

const ContestEntryModal = ({ isOpen, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [caption, setCaption] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!selectedImage || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            // Automatically append the contest hashtag as requested
            const finalCaption = caption.includes("#springcutest") ? caption : `${caption} #springcutest`;
            
            formData.append("caption", finalCaption);
            
            // Convert data URL to Blob if necessary, but handleFileChange should have the file
            // Let's assume we store the file object in a new state or get it from handled file
            const fileInput = document.getElementById('contest-photo');
            if (fileInput.files[0]) {
                formData.append("image", fileInput.files[0]);
            }

            await window.axios.post("/api/posts", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onClose();
            alert("Entry submitted successfully! Your photo is now live on the feed with #springcutest");
            // Optional: redirect to home to see the post
            window.location.href = "/homefeed";
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to submit entry. Make sure you have your pet info filled out.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="contest-modal-overlay">
                <motion.div 
                    className="contest-modal-bg" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />
                <motion.div 
                    className="contest-modal-content"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <div className="modal-header">
                        <h2>Enter Contest</h2>
                        <button onClick={onClose}><X size={24} weight="bold" /></button>
                    </div>

                    <div className="modal-body">
                        <div className="contest-brief">
                            <Trophy size={24} weight="fill" color="#eab308" />
                            <span>Spring Cutest Pet</span>
                        </div>

                        <div className="image-upload-area" onClick={() => document.getElementById('contest-photo').click()}>
                            {selectedImage ? (
                                <img src={selectedImage} alt="Preview" className="preview-img" />
                            ) : (
                                <div className="upload-placeholder">
                                    <CloudArrowUp size={48} weight="duotone" />
                                    <p>Click to upload your pet's spring photo</p>
                                    <span>Supports JPG, PNG (Max 5MB)</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                id="contest-photo" 
                                hidden 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                        </div>

                        <div className="upload-actions">
                            <button type="button" className="choose-image-btn" onClick={() => document.getElementById('contest-photo').click()}>
                                {selectedImage ? 'Change Image' : 'Choose Image'}
                            </button>
                        </div>

                        <div className="caption-area">
                            <label>Tell us about this photo</label>
                            <textarea 
                                placeholder="E.g. Mochi enjoying the cherry blossoms..." 
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={onClose}>Cancel</button>
                            <button 
                                className={`submit-btn ${isSubmitting ? 'loading' : ''}`} 
                                disabled={!selectedImage || isSubmitting}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? "Submitting..." : "Enter Contest"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const BadgesContests = () => {
    const [badgeFilter, setBadgeFilter] = useState("All");
    const [leaderboardFilter, setLeaderboardFilter] = useState("Week");
    const [showContestModal, setShowContestModal] = useState(false);
    const [entryCount, setEntryCount] = useState(0);
    const [badges, setBadges] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [earnedCount, setEarnedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const fetchBadges = async () => {
        try {
            const res = await window.axios.get('/api/badges');
            setBadges(res.data.badges || []);
            setEarnedCount(res.data.earned_count || 0);
            setTotalCount(res.data.total_count || 0);
        } catch (err) { console.error(err); }
    };

    const fetchLeaderboard = async (period = 'week') => {
        try {
            const res = await window.axios.get(`/api/badges/leaderboard?period=${period}`);
            setLeaderboard(res.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchEntryCount = async () => {
        try {
            const res = await window.axios.get("/api/posts?hashtag=springcutest");
            const total = res.data?.total || 0;
            setEntryCount(total);
        } catch (err) {
            console.error(err);
        }
    };

    React.useEffect(() => {
        fetchBadges();
        fetchLeaderboard(leaderboardFilter);
        fetchEntryCount();
        const params = new URLSearchParams(window.location.search);
        if (params.get('enterContest') === 'true') {
            setShowContestModal(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    React.useEffect(() => {
        fetchLeaderboard(leaderboardFilter);
    }, [leaderboardFilter]);

    const filteredBadges = badges.filter(badge => {
        if (badgeFilter === "All") return true;
        if (badgeFilter === "Earned") return badge.status === "earned";
        if (badgeFilter === "In Progress") return badge.status === "in-progress";
        if (badgeFilter === "Locked") return badge.status === "in-progress" || badge.status === "locked";
        return true;
    });

    return (
        <div className="pawtastic-feed modern-badges">
            <Sidebar />

            <main className="feed-main">
                <header className="page-header">
                    <h1>Badges & Contests</h1>
                    <p>Earn achievements, track pet milestones, and climb the leaderboard!</p>
                </header>

                <section className="badges-section">
                    <div className="section-top">
                        <h2>Your Badges</h2>
                        <span className="badges-count">4 / 12 earned</span>
                    </div>

                    <div className="filters-row">
                        {["All", "Earned", "In Progress", "Locked"].map(f => (
                            <button 
                                key={f} 
                                className={`filter-btn ${badgeFilter === f ? "active" : ""}`}
                                onClick={() => setBadgeFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="badges-grid">
                        <AnimatePresence>
                            {filteredBadges.map(badge => {
                                const rarityLabel = badge.rarity || 'Common';
                                const rarity = rarityLabel.toLowerCase();

                                return (
                                <motion.div 
                                    key={badge.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className={`badge-card ${badge.status} border-${rarity}`}
                                >
                                    <div className="badge-card__top-icon">
                                        {badge.status === "earned" && <CheckCircle className="status-icon earned-icon" weight="fill" />}
                                        {(badge.status === "in-progress" || badge.status === "locked") && <LockKey className="status-icon locked-icon" weight="bold" />}
                                    </div>
                                    <div className={`badge-icon-wrap ${badge.gradient || 'bg-gradient-orange'}`}>
                                        {React.createElement(iconMap[badge.icon] || Star, { size: 24, weight: "fill", color: "#fff" })}
                                    </div>
                                    <h4 className="badge-name">{badge.name}</h4>
                                    <p className="badge-desc">{badge.description}</p>

                                    {badge.progress !== undefined && badge.total !== undefined ? (
                                        <div className="badge-progress">
                                            <div className="progress-bar">
                                                <div 
                                                    className={`progress-fill fill-${rarity}`} 
                                                    style={{ width: `${(badge.progress / badge.total) * 100}%` }} 
                                                />
                                            </div>
                                            <span className="progress-text">{badge.progress}/{badge.total}</span>
                                        </div>
                                    ) : (
                                        <div className="badge-spacer"></div>
                                    )}

                                    <span className={`badge-rarity rarity-${rarity}`}>{rarityLabel}</span>
                                </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </section>

                <section className="leaderboard-section">
                    <div className="section-top">
                        <h2>Leaderboard</h2>
                        <div className="filters-row small-filters">
                            {["Week", "Month", "All Time"].map(f => (
                                <button 
                                    key={f} 
                                    className={`filter-btn ${leaderboardFilter === f ? "active" : ""}`}
                                    onClick={() => setLeaderboardFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="leaderboard-list">
                        {leaderboard.map((user, index) => (
                            <div key={user.rank} className="leaderboard-item">
                                <div className={`rank-badge rank-${user.rank}`}>
                                    {user.rank === 1 ? <Crown size={20} weight="fill" color="#fff" /> : user.rank}
                                </div>
                                <div className="user-avatar">
                                    <img src={user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) + "&background=898AA6&color=fff"} alt={user.name} />
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user.name}</span>
                                    <div className="user-stats">
                                        <span className="stat"><TrendUp size={14} weight="fill"/> {user.score} posts</span>
                                        <span className="stat"><Users size={14} weight="fill"/> {user.followers} followers</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {leaderboard.length === 0 && <div className="leaderboard-empty">No leaderboard data yet</div>}

                        {/* Current User Row */}
                        <div className="leaderboard-item current-user-item">
                            <div className="rank-badge rank-3">3</div>
                            <div className="user-avatar">
                                <img src="https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png" alt="You" />
                            </div>
                            <div className="user-info">
                                <span className="user-name">You (Sarah & Mochi)</span>
                                <div className="user-stats">
                                    <span className="stat text-dark">Top 5% this week 🚀</span>
                                </div>
                            </div>
                            <div className="user-xp">
                                <span className="xp-val">3,990</span>
                                <span className="xp-lbl">XP</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="contests-section">
                    <div className="section-top">
                        <h2>Live Contest</h2>
                        <span className="live-pill">LIVE</span>
                    </div>

                    <div className="contest-banner-card">
                        <div className="contest-content">
                            <div className="contest-info-main">
                                <div className="contest-icon">
                                    <Trophy size={40} weight="fill" color="#fff" />
                                </div>
                                <div className="text-details">
                                    <h3>Spring Cutest Pet</h3>
                                    <p>Share your pet's best spring-themed photo and win an Epic Badge + 1000 XP!</p>
                                    <div className="contest-meta">
                                        <span className="meta-item"><Fire size={16} weight="bold" /> 2 days left</span>
                                        <span className="meta-item"><Users size={16} weight="bold" /> {entryCount} entries</span>
                                    </div>
                                </div>
                            </div>

                            <div className="contest-action-area">
                                <div className="contest-progress-wrap">
                                    <div className="progress-labels">
                                        <span>Current Progress</span>
                                        <span>75%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                                <button 
                                    className="enter-contest-btn"
                                    onClick={() => setShowContestModal(true)}
                                >
                                    Enter Contest
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <ContestEntryModal 
                isOpen={showContestModal} 
                onClose={() => setShowContestModal(false)} 
            />
        </div>
    );
};

export default BadgesContests;

