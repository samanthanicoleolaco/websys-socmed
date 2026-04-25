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

// ── Mock Data ────────────────────────────────────────────────────────

const BADGES_DATA = [
    { id: 1, name: "Top Poster", description: "Posted 50+ times", icon: Star, gradient: "bg-gradient-orange", rarity: "Common", status: "earned" },
    { id: 2, name: "Social Butterfly", description: "Made 20+ friends", icon: Heart, gradient: "bg-gradient-pink", rarity: "Rare", status: "earned" },
    { id: 3, name: "Contest Winner", description: "Won a pet contest", icon: Trophy, gradient: "bg-gradient-yellow", rarity: "Epic", status: "earned" },
    { id: 4, name: "Adoption Hero", description: "Helped 3 pets get adopted", icon: Heart, gradient: "bg-gradient-green", rarity: "Rare", status: "earned" },
    { id: 5, name: "Champion", description: "Reach top 10 leaderboard", icon: Crown, gradient: "bg-gradient-gold", rarity: "Legendary", status: "in-progress", progress: 7, total: 10 },
    { id: 6, name: "Energizer", description: "Active 30 days in a row", icon: Lightning, gradient: "bg-gradient-blue", rarity: "Epic", status: "in-progress", progress: 18, total: 30 },
    { id: 7, name: "Community Star", description: "Received 500+ likes", icon: Medal, gradient: "bg-gradient-purple", rarity: "Rare", status: "in-progress", progress: 312, total: 500 },
    { id: 8, name: "Happy Vibes", description: "Spread joy to 100 users", icon: Smiley, gradient: "bg-gradient-teal", rarity: "Common", status: "in-progress", progress: 64, total: 100 },
    { id: 9, name: "Shutterbug", description: "Shared 25 pet photos", icon: Camera, gradient: "bg-gradient-orange", rarity: "Common", status: "locked", progress: 17, total: 25 },
    { id: 10, name: "Viral Moment", description: "Post reached 1000 views", icon: Fire, gradient: "bg-gradient-red", rarity: "Epic", status: "locked", progress: 0, total: 1 },
    { id: 11, name: "Super Fan", description: "Follow 50 pet profiles", icon: Users, gradient: "bg-gradient-blue", rarity: "Common", status: "locked", progress: 31, total: 50 },
    { id: 12, name: "Legendary Pet", description: "All badges earned", icon: Sparkle, gradient: "bg-gradient-magenta", rarity: "Legendary", status: "locked", progress: 4, total: 12 }
];

const LEADERBOARD_DATA = [
    { rank: 1, name: "Sarah & Mochi", badges: 8, streak: "14d", xp: "4,820 XP", avatar: "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png" },
    { rank: 2, name: "Luna's Mom", badges: 6, streak: "9d", xp: "4,310 XP", avatar: "https://c.animaapp.com/mnucpod10UwxJn/img/ai_4.png" },
    { rank: 3, name: "Buddy's Dad", badges: 5, streak: "21d", xp: "3,990 XP", avatar: "https://c.animaapp.com/mnucpod10UwxJn/img/ai_3.png" },
    { rank: 4, name: "Whiskers Fan", badges: 4, streak: "6d", xp: "3,450 XP", avatar: "https://c.animaapp.com/mnucpod10UwxJn/img/ai_2.png" },
    { rank: 5, name: "Max's Owner", badges: 3, streak: "3d", xp: "3,100 XP", avatar: "https://c.animaapp.com/mnucpod10UwxJn/img/ai_1.png" },
];

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
            alert(err.response?.data?.message || "Failed to submit entry. Make sure you have a pet profile.");
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
                                {isSubmitting ? "Submitting..." : "Submit Entry"}
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

    const fetchEntryCount = async () => {
        try {
            const res = await window.axios.get("/api/posts?hashtag=springcutest");
            // The API returns paginated data, but the 'total' field has the count
            const total = res.data?.total || 0;
            setEntryCount(total);
        } catch (err) {
            console.error(err);
        }
    };
    
    React.useEffect(() => {
        fetchEntryCount();
        const params = new URLSearchParams(window.location.search);
        if (params.get('enterContest') === 'true') {
            setShowContestModal(true);
            // Optional: clean up URL without reload
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const filteredBadges = BADGES_DATA.filter(badge => {
        if (badgeFilter === "All") return true;
        if (badgeFilter === "Earned") return badge.status === "earned";
        if (badgeFilter === "In Progress") return badge.status === "in-progress";
        if (badgeFilter === "Locked") return badge.status === "locked";
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
                            {filteredBadges.map(badge => (
                                <motion.div 
                                    key={badge.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className={`badge-card ${badge.status} border-${badge.rarity.toLowerCase()}`}
                                >
                                    <div className="badge-card__top-icon">
                                        {badge.status === "earned" && <CheckCircle className="status-icon earned-icon" weight="fill" />}
                                        {(badge.status === "in-progress" || badge.status === "locked") && <LockKey className="status-icon locked-icon" weight="bold" />}
                                    </div>
                                    <div className={`badge-icon-wrap ${badge.gradient}`}>
                                        {React.createElement(badge.icon, { size: 32, weight: "fill", color: "#fff" })}
                                    </div>
                                    <h4 className="badge-name">{badge.name}</h4>
                                    <p className="badge-desc">{badge.description}</p>
                                    
                                    {badge.progress !== undefined ? (
                                        <div className="badge-progress">
                                            <div className="progress-bar">
                                                <div 
                                                    className={`progress-fill fill-${badge.rarity.toLowerCase()}`} 
                                                    style={{ width: `${(badge.progress / badge.total) * 100}%` }} 
                                                />
                                            </div>
                                            <span className="progress-text">{badge.progress}/{badge.total}</span>
                                        </div>
                                    ) : (
                                        <div className="badge-spacer"></div>
                                    )}

                                    <span className={`badge-rarity rarity-${badge.rarity.toLowerCase()}`}>{badge.rarity}</span>
                                </motion.div>
                            ))}
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
                        {LEADERBOARD_DATA.map((user, index) => (
                            <div key={user.rank} className="leaderboard-item">
                                <div className={`rank-badge rank-${user.rank}`}>
                                    {user.rank === 1 ? <Crown size={20} weight="fill" color="#fff" /> : user.rank}
                                </div>
                                <div className="user-avatar">
                                    <img src={user.avatar} alt={user.name} />
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user.name}</span>
                                    <div className="user-stats">
                                        <span className="stat"><Medal size={14} weight="fill"/> {user.badges} badges</span>
                                        <span className="stat"><Fire size={14} weight="fill"/> {user.streak} streak</span>
                                    </div>
                                </div>
                                <div className="user-xp">
                                    <span className="xp-val">{user.xp.split(" ")[0]}</span>
                                    <span className="xp-lbl">XP</span>
                                </div>
                            </div>
                        ))}

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

