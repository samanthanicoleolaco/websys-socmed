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
    Medal,
    Calendar,
    Tag,
    BookmarkSimple
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
    
    // Updated badges to match screenshot style
    const badges = [
        { id: 1, name: "Pawfect Learner", description: "Mastering basic commands", icon: <Star weight="fill" />, color: "#898AA6" },
        { id: 2, name: "Park Explorer", description: "Earned by visiting multiple parks", icon: <Trophy weight="fill" />, color: "#898AA6" },
        { id: 3, name: "Social Butterfly", description: "Love meeting new people and animals", icon: <Heart weight="fill" />, color: "#898AA6" },
    ];

    const tabs = [
        { id: "Posts", icon: <GridFour size={20} /> },
        { id: "Tagged", icon: <Tag size={20} /> },
        { id: "Saved", icon: <BookmarkSimple size={20} /> },
    ];

    return (
        <div className="profile-page">
            <Sidebar />

            <main className="profile-main">
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

                {/* Profile Header - Horizontal Layout */}
                <div className="profile-header">
                    {/* Avatar */}
                    <div className="profile-avatar">
                        <img src={pet.image_url || "/images/default-pet.png"} alt={pet.name} />
                    </div>

                    {/* Info */}
                    <div className="profile-info">
                        <h1 className="profile-name">{pet.name}</h1>
                        <p className="profile-username">@{username}</p>
                        <div className="profile-stats">
                            <span>{followersCount} Followers</span>
                            <span className="dot">•</span>
                            <span>{postsCount} Posts</span>
                            <span className="dot">•</span>
                            <span>{followingCount} Following</span>
                        </div>
                        <p className="profile-bio">{pet.bio || "Living life one tail wag at a time. Lover of parks, belly rubs, and every stranger I've ever met."}</p>
                    </div>

                    {/* Edit Button - Right Aligned */}
                    {isOwnProfile && (
                        <button className="btn-edit-profile">
                            <PencilSimple size={16} weight="bold" />
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Two Column Layout */}
                <div className="profile-content-wrapper">
                    {/* Left Sidebar */}
                    <aside className="profile-sidebar">
                        {/* Highlights */}
                        <div className="sidebar-card">
                            <h3>Highlights</h3>
                            <div className="highlight-circle">
                                <Plus size={32} weight="bold" />
                            </div>
                        </div>

                        {/* Pet's Info */}
                        <div className="sidebar-card">
                            <div className="sidebar-card-header">
                                <h3>Pet's Info</h3>
                                <button className="view-all-link" onClick={() => alert("View All Pet Info")}>View All</button>
                            </div>
                            <div className="pet-info-list">
                                <div className="pet-info-item">
                                    <PawPrint size={16} weight="fill" />
                                    <span>{petType}</span>
                                </div>
                                <div className="pet-info-item">
                                    <Calendar size={16} weight="fill" />
                                    <span>{petAge}</span>
                                </div>
                                {pet.location && (
                                    <div className="pet-info-item">
                                        <MapPin size={16} weight="fill" />
                                        <span>{pet.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Earned Badges */}
                        <div className="sidebar-card">
                            <div className="sidebar-card-header">
                                <h3>Earned Badges</h3>
                                <button className="view-all-link" onClick={() => alert("View All Badges")}>View All</button>
                            </div>
                            <div className="badges-list">
                                {badges.map(badge => (
                                    <div key={badge.id} className="badge-list-item">
                                        <div className="badge-icon" style={{ backgroundColor: badge.color }}>
                                            {badge.icon}
                                        </div>
                                        <div className="badge-text">
                                            <h4>{badge.name}</h4>
                                            <p>{badge.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Right Content */}
                    <div className="profile-content">
                        {/* Tabs */}
                        <div className="profile-tabs">
                            {tabs.map(tab => (
                                <button
                                    type="button"
                                    key={tab.id}
                                    className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon}
                                    {tab.id}
                                </button>
                            ))}
                        </div>

                        {/* Gallery Grid */}
                        <div className="profile-gallery">
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
                                    <div className="gallery-overlay">
                                        <span><Heart size={20} weight="fill" /> {post.likes_count || 0}</span>
                                    </div>
                                </div>
                            ))}
                            {(!pet.posts || pet.posts.length === 0) && (
                                <div className="gallery-empty-message">
                                    <p>No posts yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;




