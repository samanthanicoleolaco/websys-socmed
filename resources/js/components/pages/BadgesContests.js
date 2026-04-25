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
    LockKey
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

const BadgesContests = () => {
    const [badgeFilter, setBadgeFilter] = useState("All");
    const [leaderboardFilter, setLeaderboardFilter] = useState("Week");

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
            </main>
        </div>
    );
};

export default BadgesContests;

