import React, { useState, useEffect } from "react";
import {
    Heart,
    Eye,
    PawPrint,
    MapPin,
    Camera,
    PencilSimple,
    GridFour,
    Bookmark,
    DotsThree,
    Play,
    Star,
    Trophy,
    Plus,
    Medal
} from "@phosphor-icons/react";
import Sidebar from "./Sidebar";
import axios from "axios";
import "../../../sass/pages/profile.scss";

const Profile = () => {
    const [pet, setPet] = useState(null);
    const [userPets, setUserPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Posts");
    const [isFollowing, setIsFollowing] = useState(false);

    const getPetId = () => {
        const parts = window.location.pathname.split("/");
        const lastPart = parts[parts.length - 1];
        return (lastPart === "profile" || !lastPart) ? null : lastPart;
    };

    useEffect(() => {
        fetchData();
    }, [window.location.pathname]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const id = getPetId();
            
            // Assuming /api/pets is paginated and returns { data: [...] }
            const myPetsRes = await axios.get("/api/pets");
            const petsArray = myPetsRes.data?.data || myPetsRes.data || [];
            setUserPets(Array.isArray(petsArray) ? petsArray : []);
            
            const targetId = id || (Array.isArray(petsArray) && petsArray.length > 0 ? petsArray[0].id : null);
            
            if (!targetId) {
                setLoading(false);
                return;
            }

            const response = await axios.get(`/api/pets/${targetId}`);
            setPet(response.data);
            setIsFollowing(response.data.is_following);
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="profile-loading">
            <div className="spinner"></div>
            <p>Loading Profile...</p>
        </div>
    );
    
    if (!pet) return (
        <div className="profile-error">
            <Sidebar />
            <div className="profile-error__content">
                <PawPrint size={64} weight="thin" />
                <h2>Pet not found</h2>
                <button onClick={() => window.history.back()} className="profile-error__back-btn">
                    Go Back
                </button>
            </div>
        </div>
    );

    const isOwnProfile = userPets.some(p => p.id === pet.id);
    const postsCount = pet.posts?.length || 0;
    const followersCount = pet.followers_count || 0;
    const followingCount = pet.following_count || 0;
    const username = pet.username || pet.handle || `${pet.name || "pet"}`.toLowerCase().replace(/\s+/g, "_");
    const petType = pet.type || pet.species || "Aspin";
    const petAge = pet.age || "2 years old";
    
    // Default badges to match the screenshot if none exist
    const badges = [
        { id: 1, name: "Top Poster", description: "Posted 10+ times this week", icon: <Star weight="fill" />, colorClass: "gold", iconClass: "gold-icon" },
        { id: 2, name: "Social Butterfly", description: "Received 500+ likes", icon: <Heart weight="fill" />, colorClass: "pink", iconClass: "pink-icon" },
        { id: 3, name: "Contest Winner", description: "Won Spring 2024 contest", icon: <Trophy weight="fill" />, colorClass: "purple", iconClass: "purple-icon" },
        { id: 4, name: "Adoption Hero", description: "Shared 5 adoption posts", icon: <Medal weight="fill" />, colorClass: "green", iconClass: "green-icon" },
    ];

    const tabs = [
        { id: "Posts", icon: <GridFour size={20} weight={activeTab === "Posts" ? "fill" : "regular"} /> },
        { id: "Tagged", icon: <PawPrint size={20} weight={activeTab === "Tagged" ? "fill" : "regular"} /> },
        { id: "Saved", icon: <Bookmark size={20} weight={activeTab === "Saved" ? "fill" : "regular"} /> },
    ];

    return (
        <div className="profile-page">
            <Sidebar />

            <main className="profile-main">
                <header className="profile-header">
                    {/* Cover Photo */}
                    <div className="profile-cover">
                        <img 
                            src={pet.cover_photo_url || "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop"} 
                            alt="Cover" 
                            className="profile-cover__img" 
                        />
                        {isOwnProfile && (
                            <button className="profile-cover__edit-btn">
                                <Camera size={18} weight="bold" />
                                Edit Cover
                            </button>
                        )}
                    </div>

                    {/* Profile Info Section */}
                    <div className="profile-info-section">
                        <div className="profile-info-main">
                            {/* Avatar */}
                            <div className="profile-avatar-wrap">
                                <div className="profile-avatar-img">
                                    <img src={pet.image_url || "/images/default-pet.png"} alt={pet.name} />
                                </div>
                            </div>

                            {/* Info Content */}
                            <div className="profile-info-content">
                                <h1 className="profile-info-content__name">{pet.name}</h1>
                                <p className="profile-info-content__username">@{username}</p>

                                <div className="profile-info-content__meta-line">
                                    <span><PawPrint size={14} weight="fill" /> {petType}</span>
                                    <span>{petAge}</span>
                                    {pet.location && <span><MapPin size={14} weight="fill" /> {pet.location}</span>}
                                </div>

                                <div className="profile-info-content__stats-row">
                                    <span>{postsCount} Post{postsCount !== 1 ? "s" : ""}</span>
                                    <span>{followersCount} Follower{followersCount !== 1 ? "s" : ""}</span>
                                    <span>{followingCount} Following</span>
                                </div>

                                <div className="profile-info-content__bio">
                                    <span>{pet.bio || "Living life one tail wag at a time. Lover of parks, belly rubs, and every stranger I've ever met."}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="profile-header-actions">
                            {isOwnProfile ? (
                                <>
                                    <button className="btn-profile btn-profile--primary">
                                        <Plus size={18} weight="bold" />
                                        Add Story
                                    </button>
                                    <button className="btn-profile btn-profile--secondary">
                                        <PencilSimple size={18} weight="bold" />
                                        Edit
                                    </button>
                                </>
                            ) : (
                                <button className={`btn-profile btn-profile--primary ${isFollowing ? 'following' : ''}`}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <div className="badges-section">
                    <div className="badges-section__header">
                        <h3>Earned Badges</h3>
                        <a href="#" className="view-all">View all</a>
                    </div>
                    <div className="badges-section__grid">
                        {badges.map(badge => (
                            <div key={badge.id} className={`badge-card ${badge.colorClass}`}>
                                <div className={`badge-card__icon-wrap ${badge.iconClass}`}>
                                    {badge.icon}
                                </div>
                                <div className="badge-card__content">
                                    <h4>{badge.name}</h4>
                                    <p>{badge.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="profile-tabs-nav">
                    {tabs.map(tab => (
                        <button
                            type="button"
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                            aria-pressed={activeTab === tab.id}
                        >
                            {tab.icon}
                            {tab.id}
                        </button>
                    ))}
                </div>

                <div className="profile-gallery-container">
                    {pet.posts?.map((post) => (
                        <div key={post.id} className="gallery-item">
                            {post.video_url ? (
                                <>
                                    <video src={post.video_url} muted />
                                    <div className="video-icon"><Play size={20} weight="fill" /></div>
                                </>
                            ) : (
                                <img src={post.image_url} alt={post.caption} />
                            )}
                            <div className="gallery-item__overlay">
                                <span><Heart size={20} weight="fill" /> {post.likes_count || 0}</span>
                                <span><Eye size={20} weight="fill" /> {post.views || 0}</span>
                            </div>
                        </div>
                    ))}
                    {(!pet.posts || pet.posts.length === 0) && (
                        <div className="profile-empty-state">
                            <PawPrint size={48} />
                            <p>No posts to show yet.</p>
                            {isOwnProfile && <small>Share your first post to bring your profile to life.</small>}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;




