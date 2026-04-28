import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    BookmarkSimple,
    X
} from "@phosphor-icons/react";
import Sidebar from "./Sidebar";
import axios from "axios";
import { PostModal } from "./Feed";
import "../../../sass/pages/profile.scss";

const Profile = () => {
    const [pet, setPet] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Posts");
    const [isFollowing, setIsFollowing] = useState(false);
    const [taggedPosts, setTaggedPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [activePost, setActivePost] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [showPetInfoModal, setShowPetInfoModal] = useState(false);
    const [showBadgesModal, setShowBadgesModal] = useState(false);

    // Map raw API post → PostModal format
    const normalizePost = (p) => {
        const image = p.image_url || (p.image ? (p.image.startsWith('http') ? p.image : `/storage/${p.image}`) : null);
        const video = p.video_url || (p.video ? (p.video.startsWith('http') ? p.video : `/storage/${p.video}`) : null);
        
        return {
            id: p.id,
            author: p.pet?.name || "Unknown",
            breed: p.pet?.breed || "",
            location: p.location || "",
            avatar: p.pet?.image_url || p.pet?.photo_url || null,
            time: p.created_at ? new Date(p.created_at).toLocaleDateString() : "just now",
            content: p.caption || "",
            hashtags: (p.caption?.match(/#\w+/g) || []),
            image: image,
            video: video,
            likes: p.likes_count ?? 0,
            comments: p.comments_count ?? 0,
            isLiked: !!p.liked_by_me,
            isSaved: !!p.is_saved || !!p.saved_by_me,
            privacy: p.privacy || "public",
            tagged_pets: p.tagged_pets || [],
            pet: p.pet || null,
            user: p.pet?.user || null,
        };
    };
    const [activeHighlight, setActiveHighlight] = useState(null);
    const coverInputRef = useRef(null);

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

            const meRes = await axios.get('/api/user');
            const me = meRes.data || {};
            setCurrentUserId(me.id || null);

            const targetId = id || me?.pet?.id || null;
            
            if (!targetId) {
                setLoading(false);
                return;
            }

            const response = await axios.get(`/api/pets/${targetId}`);
            setPet(response.data);
            setIsFollowing(response.data.is_following);

            // Fetch highlights
            try {
                const highlightsRes = await axios.get(`/api/pets/${targetId}/highlights`);
                setHighlights(highlightsRes.data);
            } catch (err) {
                console.error("Error fetching highlights:", err);
            }

            // Fetch saved posts (own profile only)
            const myPetId = me?.pet?.id;
            if (!id || String(id) === String(myPetId)) {
                try {
                    const savedRes = await axios.get('/api/saved-posts');
                    console.log("Profile: Saved Posts Data:", savedRes.data);
                    const rawSaved = savedRes.data?.data || savedRes.data || [];
                    setSavedPosts(rawSaved.map(sp => sp.post || sp));
                } catch (err) {
                    console.error("Error fetching saved posts:", err);
                }
            }

            // Fetch tagged posts for this pet
            try {
                const taggedRes = await axios.get(`/api/pets/${targetId}/tagged-posts`);
                console.log("Profile: Tagged Posts Data:", taggedRes.data);
                setTaggedPosts(taggedRes.data || []);
            } catch (err) {
                console.error("Error fetching tagged posts:", err);
            }

        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHighlight = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('media', file);
            formData.append('is_highlight', '1');
            try {
                const res = await axios.post('/api/stories', formData);
                // Refresh highlights
                const highlightsRes = await axios.get(`/api/pets/${pet.id}/highlights`);
                setHighlights(highlightsRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        input.click();
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("cover_photo", file);

        try {
            const res = await axios.post(`/api/pets/${pet.id}/cover`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            // Update local pet state with new cover URL
            setPet(prev => ({
                ...prev,
                cover_photo_url: res.data.cover_photo_url
            }));
        } catch (error) {
            console.error("Error uploading cover photo:", error);
            alert("Failed to upload cover photo.");
        }
    };

    const handleSavePost = async (post) => {
        try {
            await axios.post("/api/saved-posts", { post_id: post.id });
            const meRes = await axios.get('/api/user');
            const me = meRes.data || {};
            const id = getPetId();
            const myPetId = me?.pet?.id;
            if (!id || String(id) === String(myPetId)) {
                const savedRes = await axios.get('/api/saved-posts');
                const rawSaved = savedRes.data?.data || savedRes.data || [];
                setSavedPosts(rawSaved.map(sp => sp.post || sp));
            }
            setActivePost((prev) => prev?.id === post.id ? { ...prev, isSaved: true } : prev);
        } catch (err) {
            console.error(err);
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

    const isOwnProfile = currentUserId && pet?.user_id === currentUserId;
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
                        <>
                            <button className="profile-cover__edit-btn" onClick={() => coverInputRef.current?.click()}>
                                <Camera size={18} weight="bold" />
                                Edit Cover
                            </button>
                            <input
                                type="file"
                                ref={coverInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleCoverUpload}
                            />
                        </>
                    )}
                </div>

                {/* Profile Header - Horizontal Layout */}
                <div className="profile-header">
                    {/* Avatar */}
                    <div className="profile-avatar">
                        <img 
                            src={pet.image_url || pet.user?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.name || 'Pet')}&background=898AA6&color=fff`} 
                            alt={pet.name} 
                            onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.name || 'Pet')}&background=898AA6&color=fff`;
                            }}
                        />
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
                            <div className="highlights-list" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                                {highlights.map(highlight => (
                                    <div 
                                        key={highlight.id} 
                                        className="highlight-circle" 
                                        onClick={() => setActiveHighlight(highlight)}
                                        style={{ 
                                            width: '60px', 
                                            height: '60px', 
                                            borderRadius: '50%', 
                                            overflow: 'hidden', 
                                            border: '2px solid var(--primary-action)',
                                            cursor: 'pointer',
                                            flexShrink: 0
                                        }}
                                    >
                                        <img 
                                            src={highlight.media_url || highlight.media_path} 
                                            alt="Highlight" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>
                                ))}
                                {isOwnProfile && (
                                    <div className="highlight-circle" 
                                        onClick={handleAddHighlight}
                                        style={{ 
                                            width: '60px', 
                                            height: '60px', 
                                            borderRadius: '50%', 
                                            border: '2px dashed var(--border-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            color: 'var(--text-muted)'
                                        }}
                                    >
                                        <Plus size={24} weight="bold" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pet's Info */}
                        <div className="sidebar-card">
                            <div className="sidebar-card-header">
                                <h3>Pet's Info</h3>
                                <button className="view-all-link" onClick={() => setShowPetInfoModal(true)}>View All</button>
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
                                <button className="view-all-link" onClick={() => setShowBadgesModal(true)}>View All</button>
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
                            {(() => {
                                let postsToDisplay = [];
                                if (activeTab === "Posts") {
                                    postsToDisplay = pet.posts || [];
                                } else if (activeTab === "Tagged") {
                                    postsToDisplay = taggedPosts;
                                } else if (activeTab === "Saved") {
                                    postsToDisplay = savedPosts;
                                }
                                
                                if (postsToDisplay.length === 0) {
                                    return (
                                        <div className="gallery-empty-message">
                                            <p>No {activeTab.toLowerCase()} yet</p>
                                        </div>
                                    );
                                }
                                
                                return postsToDisplay.map((post) => (
                                    <div key={post.id} className="gallery-item" onClick={() => setActivePost(normalizePost(post))}>
                                        {post.video_url || post.video ? (
                                            <>
                                                <video src={post.video_url || (post.video?.startsWith('http') ? post.video : `/storage/${post.video}`)} muted />
                                                <div className="video-icon"><Play size={20} weight="fill" /></div>
                                            </>
                                        ) : (
                                            <img 
                                                src={post.image_url || (post.image?.startsWith('http') ? post.image : `/storage/${post.image}`)} 
                                                alt={post.caption || 'Post image'} 
                                            />
                                        )}
                                        <div className="gallery-overlay">
                                            <span><Heart size={20} weight="fill" /> {post.likes_count || 0}</span>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {activePost && (
                    <PostModal 
                        post={activePost} 
                        onClose={() => setActivePost(null)}
                        onSave={handleSavePost}
                        onLike={async (postId) => {
                            try {
                                const response = await axios.post(`/api/posts/${postId}/like`);
                                setPet(prev => {
                                    if(!prev) return prev;
                                    const updatedPosts = prev.posts.map(p => 
                                        p.id === postId ? { 
                                            ...p, 
                                            isLiked: response.data.liked,
                                            likes_count: response.data.likes_count
                                        } : p
                                    );
                                    return { ...prev, posts: updatedPosts };
                                });
                                setActivePost(prev => ({
                                    ...prev,
                                    isLiked: response.data.liked,
                                    likes_count: response.data.likes_count
                                }));
                            } catch (error) {
                                console.error(error);
                            }
                        }}
                        onCommentAdded={(postId, created) => {
                            setPet(prev => {
                                if(!prev) return prev;
                                const updatedPosts = prev.posts.map(p => 
                                    p.id === postId ? {
                                        ...p,
                                        comments_count: (p.comments_count || 0) + 1
                                    } : p
                                );
                                return { ...prev, posts: updatedPosts };
                            });
                        }}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {activeHighlight && (
                    <div className="post-modal-overlay" onClick={() => setActiveHighlight(null)}>
                        <div className="post-modal-bg" />
                        <div 
                            className="highlight-viewer-content"
                            style={{ position: 'relative', zIndex: 101, maxWidth: '400px', width: '100%', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {activeHighlight.media_type === 'video' ? (
                                <video src={activeHighlight.media_url || activeHighlight.media_path} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', borderRadius: '16px' }} />
                            ) : (
                                <img src={activeHighlight.media_url || activeHighlight.media_path} alt="Highlight" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', borderRadius: '16px' }} />
                            )}
                        </div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showPetInfoModal && (
                    <div className="post-modal-overlay" onClick={() => setShowPetInfoModal(false)}>
                        <div className="post-modal-bg" />
                        <motion.div 
                            className="sidebar-card"
                            style={{ position: 'relative', zIndex: 101, maxWidth: '500px', width: '90%', maxHeight: '90vh', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sidebar-card-header" style={{ marginBottom: '20px', flexShrink: 0 }}>
                                <h3>Full Pet Information</h3>
                                <button onClick={() => setShowPetInfoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div className="pet-info-list" style={{ gap: '16px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                                <div className="pet-info-item">
                                    <PawPrint size={20} weight="fill" />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <small style={{ color: 'var(--text-muted)' }}>Species/Breed</small>
                                        <span>{petType} ({pet.breed || 'Unknown'})</span>
                                    </div>
                                </div>
                                <div className="pet-info-item">
                                    <Calendar size={20} weight="fill" />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <small style={{ color: 'var(--text-muted)' }}>Age</small>
                                        <span>{petAge}</span>
                                    </div>
                                </div>
                                <div className="pet-info-item">
                                    <MapPin size={20} weight="fill" />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <small style={{ color: 'var(--text-muted)' }}>Location</small>
                                        <span>{pet.location || 'Not set'}</span>
                                    </div>
                                </div>
                                <div className="pet-info-item">
                                    <Tag size={20} weight="fill" />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <small style={{ color: 'var(--text-muted)' }}>Username</small>
                                        <span>@{username}</span>
                                    </div>
                                </div>
                                <div className="pet-info-item">
                                    <Star size={20} weight="fill" />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <small style={{ color: 'var(--text-muted)' }}>Bio</small>
                                        <span>{pet.bio || "No bio provided yet."}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showBadgesModal && (
                    <div className="post-modal-overlay" onClick={() => setShowBadgesModal(false)}>
                        <div className="post-modal-bg" />
                        <motion.div 
                            className="sidebar-card"
                            style={{ position: 'relative', zIndex: 101, maxWidth: '500px', width: '90%', maxHeight: '90vh', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sidebar-card-header" style={{ marginBottom: '20px', flexShrink: 0 }}>
                                <h3>All Earned Badges</h3>
                                <button onClick={() => setShowBadgesModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div className="badges-list" style={{ gap: '20px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                                {badges.map(badge => (
                                    <div key={badge.id} className="badge-list-item" style={{ marginBottom: '0' }}>
                                        <div className="badge-icon" style={{ backgroundColor: badge.color, width: '48px', height: '48px' }}>
                                            {React.cloneElement(badge.icon, { size: 24 })}
                                        </div>
                                        <div className="badge-text">
                                            <h4 style={{ fontSize: '1.1rem' }}>{badge.name}</h4>
                                            <p>{badge.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;




