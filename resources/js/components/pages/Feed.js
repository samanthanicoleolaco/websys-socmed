import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChatCircle,
    Image as ImageIcon,
    DotsThree,
    Bookmark,
    TrendUp,
    Video,
    X,
    Plus,
    Trophy,
    Users,
    Heart,
    EyeSlash,
    UserPlus,
    FlagBanner,
    ShareNetwork,
    MapPin,
    PaperPlaneRight,
    Globe,
    User,
    CaretDown,
    At,
    CaretLeft,
    MagnifyingGlass,
    Trash,
    Download,
    Lock,
    ShieldCheck,
    CaretRight,
} from "@phosphor-icons/react";
import Sidebar from "./Sidebar";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import "../../../sass/pages/feed.scss";

// ── Micro components ──────────────────────────────────────────────────
const Avatar = ({ src, fallback, size = "md", online = false }) => {
    const avatarSrc = src || (fallback ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fallback)}&background=898AA6&color=fff` : "https://ui-avatars.com/api/?name=User&background=898AA6&color=fff");
    return (
        <div className={`feed-avatar feed-avatar--${size} ${online ? "online" : ""}`}>
            <img src={avatarSrc} alt="avatar" />
            {online && <span className="feed-avatar__dot" />}
        </div>
    );
};

const Button = ({ children, variant = "default", className = "", ...props }) => (
    <button className={`feed-btn feed-btn--${variant} ${className}`} {...props}>{children}</button>
);

const Card = ({ children, className = "", innerRef }) => (
    <div ref={innerRef} className={`feed-card ${className}`}>{children}</div>
);

// ── Reactions ────────────────────────────────────────────────────────
const REACTIONS = [
    { key: "pup",   emoji: "🐶", label: "Love it!", color: "#f7a821" },
    { key: "cat",   emoji: "🐱", label: "Cute!",    color: "#e91e8c" },
    { key: "bunny", emoji: "🐰", label: "Aww!",     color: "#f06292" },
    { key: "fox",   emoji: "🦊", label: "Wow!",     color: "#f7b125" },
    { key: "paw",   emoji: "🐾", label: "Paw it!",  color: "#898AA6" },
];

const MENU_ITEMS = [
    { icon: Bookmark,   label: "Save this post",       sub: "Add to your saved posts collection.",  color: "var(--text-main)" },
    { icon: UserPlus,   label: "Follow this pet",      sub: "See more from this pet in your feed.", color: "var(--text-main)" },
    { divider: true },
    { icon: EyeSlash,   label: "Hide from my feed",    sub: "See fewer posts like this.",           color: "#e11d48" },
    { icon: FlagBanner, label: "Report to Petverse",   sub: "Help us keep the community safe.",     color: "#e11d48" },
];

const PostMenu = ({ postId }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        if (open) document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);
    return (
        <div className="post-menu" ref={ref}>
            <button className="post-menu__trigger" onClick={() => setOpen(!open)} aria-label="More options">
                <DotsThree size={20} weight="bold" />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div 
                        className="post-menu__dropdown" 
                        initial={{ opacity: 0, scale: 0.95, y: -8 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        {MENU_ITEMS.map((item, i) => item.divider ? <div key={i} className="post-menu__divider" /> : (
                            <button 
                                key={i} 
                                className={`post-menu__item ${item.color === '#e11d48' ? 'danger' : ''}`} 
                                onClick={() => setOpen(false)}
                            >
                                <item.icon size={18} weight="duotone" />
                                <div className="item-text">
                                    <span className="label">{item.label}</span>
                                    {item.sub && <span className="sub">{item.sub}</span>}
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Feed Component ─────────────────────────────────────────────────────

const PostLikesModal = ({ postId, onClose }) => {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const res = await window.axios.get(`/api/posts/${postId}/likes`);
                setLikes(res.data.data || res.data || []);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchLikes();
    }, [postId]);

    return (
        <div className="location-picker-overlay" style={{ zIndex: 1100 }}>
            <motion.div 
                className="location-picker" 
                style={{ maxWidth: '400px', height: '500px' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="location-picker__header">
                    <button className="back-btn" onClick={onClose}><CaretLeft size={24} /></button>
                    <h3>Likes</h3>
                </div>
                <div className="location-picker__content" style={{ padding: '0' }}>
                    {loading ? <div className="loading-locations">Loading...</div> : (
                        <div className="locations-list">
                            {likes.length === 0 ? <div className="loading-locations">No likes yet.</div> : 
                                likes.map((u) => (
                                    <div key={u.id} className="location-item" style={{ cursor: 'default' }}>
                                        <Avatar src={u.avatar} size="sm" />
                                        <div className="location-info">
                                            <span className="location-name">{u.name}</span>
                                            <span className="location-sub">@{u.name.toLowerCase().replace(/\s+/g, '')}</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const PostModal = ({ post, onClose, onLike }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);

    useEffect(() => {
        if (post) fetchComments();
    }, [post]);

    const fetchComments = async () => {
        try {
            const res = await window.axios.get(`/api/posts/${post.id}/comments`);
            setComments(res.data.data || res.data || []);
        } catch (err) { console.error(err); }
    };

    const handleCommentSubmit = async () => {
        if (!commentText.trim() || isPostingComment) return;
        setIsPostingComment(true);
        try {
            const res = await window.axios.post('/api/comments', {
                post_id: post.id,
                pet_id: window.userPetId || 1, // Fallback for testing, should use real pet ID
                content: commentText
            });
            setComments([res.data, ...comments]);
            setCommentText("");
        } catch (err) {
            console.error(err);
            alert("Failed to post comment.");
        } finally {
            setIsPostingComment(false);
        }
    };

    if (!post) return null;
    return (
        <div className="post-modal-overlay">
            <div className="post-modal-bg" onClick={onClose} />
            <motion.div 
                className={`post-modal-content ${(post.image || post.video) ? 'has-image' : 'text-only'}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            >
                {post.video && (
                    <div className="post-modal-media">
                        <video src={post.video} controls autoPlay />
                    </div>
                )}
                {post.image && !post.video && (
                    <div className="post-modal-media">
                        <img src={post.image} alt="Post content" />
                    </div>
                )}
                
                <div className="post-modal-sidebar">
                    <div className="post-modal-header">
                        <div className="user">
                            <Avatar src={post.avatar} size="md" online={true} />
                            <div className="meta">
                                <div className="meta-top">
                                    <span className="name">{post.author}</span>
                                    <span className="time">{post.time}</span>
                                </div>
                                <div className="meta-bottom">
                                    <span className="breed">{post.breed}</span>
                                    {post.location && (
                                        <span className="location">
                                            <MapPin size={12} weight="fill" /> {post.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20} weight="bold" /></button>
                    </div>

                    <div className="post-modal-scrollable">
                        <div className="post-modal-caption">
                            <Avatar src={post.avatar} size="sm" />
                            <div className="caption-content">
                                <span className="author-name">{post.author}</span>
                                <span className="text">{post.content}</span>
                                {post.hashtags && post.hashtags.length > 0 && (
                                    <div className="hashtags">
                                        {post.hashtags.map(tag => <span key={tag}>{tag}</span>)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="post-modal-comments">
                            {comments.length === 0 ? (
                                <div className="empty-state">
                                    <span>No comments yet.</span>
                                    <span>Start the conversation.</span>
                                </div>
                            ) : (
                                comments.map(c => (
                                    <div key={c.id} className="comment-item" style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '0 4px' }}>
                                        <Avatar src={c.pet?.photo_url} size="sm" />
                                        <div className="comment-content">
                                            <div style={{ background: 'var(--bg-page)', padding: '8px 12px', borderRadius: '12px' }}>
                                                <span className="author-name" style={{ fontWeight: '700', fontSize: '13px', marginRight: '6px' }}>{c.pet?.name || 'User'}</span>
                                                <span className="text" style={{ fontSize: '13px', color: 'var(--text-main)' }}>{c.content}</span>
                                            </div>
                                            <div className="comment-meta" style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '8px' }}>
                                                <span>Just now</span>
                                                <button style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: '600', cursor: 'pointer' }}>Like</button>
                                                <button style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: '600', cursor: 'pointer' }}>Reply</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="post-modal-footer">
                        <div className="actions">
                            <div className="actions-left">
                                <button className={`action-btn ${post.isLiked ? 'active' : ''}`} onClick={() => onLike(post.id)}>
                                    <Heart size={24} weight={post.isLiked ? "fill" : "bold"} />
                                </button>
                                <button className="action-btn">
                                    <ChatCircle size={24} />
                                </button>
                                <button className="action-btn">
                                    <ShareNetwork size={24} />
                                </button>
                            </div>
                            <button className="action-btn bookmark">
                                <Bookmark size={24} />
                            </button>
                        </div>
                        <div className="likes-count" onClick={() => setShowLikesModal(true)} style={{ cursor: 'pointer', fontWeight: '700' }}>
                            {post.likes} likes
                        </div>
                        <div className="add-comment">
                            <input 
                                type="text" 
                                placeholder="Add a comment..." 
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                            />
                            <button 
                                className="post-btn" 
                                onClick={handleCommentSubmit}
                                disabled={!commentText.trim() || isPostingComment}
                            >
                                {isPostingComment ? '...' : 'Post'}
                            </button>
                        </div>
                    </div>
                    {showLikesModal && <PostLikesModal postId={post.id} onClose={() => setShowLikesModal(false)} />}
                </div>
            </motion.div>
        </div>
    );
};

const Feed = () => {
    const { user } = useUser();
    const [posts, setPosts] = useState([]);
    const [dynamicStories, setStories]    = useState([]);
    const [hiddenStoryUsers, setHiddenStoryUsers] = useState([]);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [viewerState, setViewerState]   = useState({ isOpen: false, userStories: [], currentIndex: 0 });
    const [showStoryMenu, setShowStoryMenu] = useState(false);
    const [postText, setPostText]         = useState("");
    const [isCreateExpanded, setExpanded] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [postPrivacy, setPostPrivacy] = useState("public");
    const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
    const [postLocation, setPostLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [locationSearchQuery, setLocationSearchQuery] = useState("");
    const [suggestedLocations, setSuggestedLocations] = useState([]);
    
    const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
    const [taggedPets, setTaggedPets] = useState([]);
    const [petSearchQuery, setPetSearchQuery] = useState("");
    const [suggestedPets, setSuggestedPets] = useState([]);
    const [isSearchingPets, setIsSearchingPets] = useState(false);

    const [activePost, setActivePost] = useState(null);
    const [showVisibilitySubmenu, setShowVisibilitySubmenu] = useState(false);
    const [storyProgress, setStoryProgress] = useState(0);
    const [filterTag, setFilterTag] = useState(null);
    const [isSeeAllPetsOpen, setIsSeeAllPetsOpen] = useState(false);
    const [contestEntryCount, setContestEntryCount] = useState(0);

    const privacyMenuRef = useRef(null);
    const storyMenuRef = useRef(null);
    
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const addMenuRef   = useRef(null);
    const createCardRef = useRef(null);

    const [postImage, setPostImage] = useState(null);
    const [postVideo, setPostVideo] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);

    // Reset submenu when story menu closes
    useEffect(() => {
        if (!showStoryMenu) setShowVisibilitySubmenu(false);
    }, [showStoryMenu]);

    // Handle click outside for story menu
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (storyMenuRef.current && !storyMenuRef.current.contains(e.target)) {
                setShowStoryMenu(false);
            }
        };
        if (showStoryMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showStoryMenu]);

    const fetchPosts = async (hashtag = null) => {
        try {
            const url = hashtag ? `/api/posts?hashtag=${encodeURIComponent(hashtag)}` : "/api/posts";
            const res = await window.axios.get(url);
            const mappedPosts = (res.data?.data || res.data || []).map((p) => ({
                id: p.id,
                author: p.pet?.name || p.user?.name || "Petverse User",
                breed: p.pet?.breed || "Pet",
                location: p.location || "",
                avatar: p.pet?.image_url || p.user?.avatar_url || "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png",
                time: p.created_at ? new Date(p.created_at).toLocaleDateString() : "just now",
                content: p.caption || p.content || "",
                hashtags: (p.caption?.match(/#\w+/g) || []),
                image: p.image_url || p.media_url || null,
                video: p.video_url || null,
                likes: Array.isArray(p.likes) ? p.likes.length : (p.likes_count || p.like_count || 0),
                comments: Array.isArray(p.comments) ? p.comments.length : (p.comments_count || p.comment_count || 0),
                isLiked: false,
                privacy: p.privacy || 'public',
                tagged_pets: p.tagged_pets || []
            }));
            setPosts(mappedPosts);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const storiesRes = await window.axios.get("/api/stories");
                setStories(storiesRes.data);
                fetchPosts(filterTag);
                
                // Fetch contest entry count
                const contestRes = await window.axios.get("/api/posts?hashtag=springcutest");
                setContestEntryCount(contestRes.data?.total || 0);
            } catch (err) { console.error(err); }
        };
        fetchInitialData();
    }, [filterTag]);

    const handleAddClick = (e) => {
        if (e) e.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("media", file);
        try {
            await window.axios.post("/api/stories", formData);
            const res = await window.axios.get("/api/stories");
            setStories(res.data);
        } catch (err) { alert("Upload failed"); }
    };

    const handleLocationClick = () => {
        if (postLocation) {
            setPostLocation(null);
            return;
        }
        setIsLocationPickerOpen(true);
        fetchNearbyLocations();
    };

    const fetchNearbyLocations = async () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            setSuggestedLocations([
                { id: 1, name: "Central Park", sub: "New York, USA", type: "park" },
                { id: 2, name: "Downtown Area", sub: "City Center", type: "city" },
                { id: 3, name: "Local Cafe", sub: "Nearby", type: "cafe" },
            ]);
            setIsLocating(false);
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const reverseRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const reverseData = await reverseRes.json();
                    const addr = reverseData.address || {};
                    let cityName = addr.city || addr.town || addr.village || addr.county || "Current Location";
                    let stateName = addr.state || addr.region || "";
                    let countryName = addr.country || "";
                    let roadName = addr.road || addr.pedestrian || addr.street || "";
                    let currentSub = stateName ? `${cityName}, ${stateName}` : (countryName || "Nearby");
                    
                    const nearby = [
                        { id: 1, name: roadName || "Current Location", sub: currentSub, type: "pin", lat: latitude, lon: longitude },
                        { id: 2, name: "My Location", sub: `${cityName}, ${countryName || ""}`, type: "pin", lat: latitude, lon: longitude },
                    ];
                    setSuggestedLocations(nearby);
                } catch {
                    setSuggestedLocations([
                        { id: 1, name: "Current Location", sub: "Nearby", type: "pin" },
                        { id: 2, name: "Local Area", sub: "Nearby", type: "city" },
                    ]);
                } finally { setIsLocating(false); }
            },
            () => {
                setSuggestedLocations([
                    { id: 1, name: "Central Park", sub: "Popular location", type: "park" },
                    { id: 2, name: "Downtown", sub: "City Center", type: "city" },
                ]);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const searchLocations = async (query) => {
        if (!query.trim()) { fetchNearbyLocations(); return; }
        setIsLocating(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`);
            const data = await res.json();
            const results = data.map((item, index) => ({
                id: item.place_id || index + 1,
                name: item.display_name.split(",").slice(0, 2).join(", "),
                sub: item.display_name,
                type: "pin",
                lat: item.lat,
                lon: item.lon
            }));
            setSuggestedLocations(results);
        } catch (err) { console.error(err); } finally { setIsLocating(false); }
    };

    const fetchSuggestedPets = async (isSeeAll = false) => {
        setIsSearchingPets(true);
        try {
            const res = await window.axios.get("/api/pets");
            const data = res.data?.data || res.data || [];
            if (isSeeAll) {
                setSuggestedPets(data);
            } else {
                setSuggestedPets(data.slice(0, 5));
            }
        } catch (err) { console.error(err); } finally { setIsSearchingPets(false); }
    };

    const searchPets = async (query) => {
        if (!query.trim()) { fetchSuggestedPets(); return; }
        setIsSearchingPets(true);
        try {
            const res = await window.axios.get(`/api/pets?search=${encodeURIComponent(query)}`);
            const data = res.data?.data || res.data || [];
            setSuggestedPets(data.slice(0, 8));
        } catch (err) { console.error(err); } finally { setIsSearchingPets(false); }
    };

    const handleTagClick = () => {
        setIsTagPickerOpen(true);
        fetchSuggestedPets();
    };

    const toggleTagPet = (pet) => {
        setTaggedPets(prev => {
            if (prev.some(p => p.id === pet.id)) {
                return prev.filter(p => p.id !== pet.id);
            }
            return [...prev, pet];
        });
    };

    const handleImageClick = () => imageInputRef.current?.click();
    const handleVideoClick = () => videoInputRef.current?.click();

    const handleFollow = async (followingPetId) => {
        // If user has no pet, we might need to refresh user or show a better message
        const currentPetId = user?.pet?.id;
        if (!currentPetId) {
            alert("Please save your pet profile in Settings before following others.");
            return;
        }
        try {
            await window.axios.post("/api/follow", {
                follower_pet_id: user.pet.id,
                following_pet_id: followingPetId
            });
            // Update local state to show followed
            setSuggestedPets(prev => prev.map(p => p.id === followingPetId ? { ...p, is_following: true } : p));
        } catch (err) {
            console.error(err);
            alert("Already following or error occurred");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPostImage(file);
        setImagePreview(URL.createObjectURL(file));
        setPostVideo(null);
        setVideoPreview(null);
        setExpanded(true);
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPostVideo(file);
        setVideoPreview(URL.createObjectURL(file));
        setPostImage(null);
        setImagePreview(null);
        setExpanded(true);
    };

    const clearMedia = () => {
        setPostImage(null);
        setPostVideo(null);
        setImagePreview(null);
        setVideoPreview(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (videoInputRef.current) videoInputRef.current.value = "";
    };

    const handleDeleteStory = async (id) => {
        if (!confirm("Are you sure you want to delete this story?")) return;
        try {
            await window.axios.delete(`/api/stories/${id}`);
            setStories(prev => prev.map(g => ({ ...g, stories: g.stories.filter(s => s.id !== id) })).filter(g => g.stories.length > 0));
            setViewerState(p => ({ ...p, isOpen: false }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleArchiveStory = async (id) => {
        try {
            await window.axios.post(`/api/stories/${id}/archive`);
            setStories(prev => prev.map(g => ({ ...g, stories: g.stories.filter(s => s.id !== id) })).filter(g => g.stories.length > 0));
            setViewerState(p => ({ ...p, isOpen: false }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateVisibility = async (id, visibility) => {
        try {
            await window.axios.patch(`/api/stories/${id}`, { visibility });
            // Update local state in groups
            setStories(prev => prev.map(g => ({
                ...g,
                stories: g.stories.map(s => s.id === id ? { ...s, visibility } : s)
            })));
            
            setViewerState(prev => {
                const updated = [...prev.userStories];
                updated[prev.currentIndex] = { ...updated[prev.currentIndex], visibility };
                return { ...prev, userStories: updated };
            });
            setShowStoryMenu(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveStory = (story) => {
        const link = document.createElement('a');
        link.href = story.media_url || story.media_path; // Use whatever property is available
        link.download = `petverse-story-${story.id}.${story.media_type === 'video' ? 'mp4' : 'jpg'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowStoryMenu(false);
    };

    const openViewer = (group) => setViewerState({ isOpen: true, userStories: group.stories, currentIndex: 0 });
    const nextStory = () => {
        if (viewerState.currentIndex < viewerState.userStories.length - 1) {
            setViewerState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
        } else {
            setViewerState(prev => ({ ...prev, isOpen: false }));
        }
    };
    const prevStory = () => {
        if (viewerState.currentIndex > 0) {
            setViewerState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
        }
    };

    useEffect(() => {
        let progressInterval;
        if (viewerState.isOpen) {
            setStoryProgress(0);
            const duration = 5000; // 5 seconds per story
            const interval = 30; // smoother update every 30ms
            const step = (interval / duration) * 100;

            progressInterval = setInterval(() => {
                setStoryProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        nextStory();
                        return 0;
                    }
                    return prev + step;
                });
            }, interval);
        }
        return () => {
            clearInterval(progressInterval);
            setStoryProgress(0);
        };
    }, [viewerState.isOpen, viewerState.currentIndex]);

    useEffect(() => {
        const h = (e) => {
            if (addMenuRef.current && !addMenuRef.current.contains(e.target)) setIsAddMenuOpen(false);
            if (privacyMenuRef.current && !privacyMenuRef.current.contains(e.target)) setShowPrivacyMenu(false);
            if (createCardRef.current && !createCardRef.current.contains(e.target)) {
                if (!postText.trim() && !imagePreview && !videoPreview) {
                    setExpanded(false);
                }
            }
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [postText, imagePreview, videoPreview]);

    const toggleLike = (id) => {
        setPosts(posts.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
    };

    const isValidMediaUrl = (url) => {
        if (!url || typeof url !== "string") return false;
        return /^(https?:\/\/|\/|data:image\/|blob:)/i.test(url.trim());
    };

    const visibleStories = dynamicStories
        .filter((group) => group?.user && group?.stories?.length && !hiddenStoryUsers.includes(group.user.id))
        .filter((group) => {
            const media = group?.user?.avatar_url || group?.latest_story?.media_url || group?.stories?.[0]?.media_url;
            return isValidMediaUrl(media);
        });

    const submitPost = async () => {
        const trimmed = postText.trim();
        if ((!trimmed && !postImage && !postVideo) || isPosting) return;
        setIsPosting(true);
        try {
            const formData = new FormData();
            formData.append("caption", trimmed);
            formData.append("privacy", postPrivacy);
            if (postLocation) {
                formData.append("location", postLocation.name);
                if (postLocation.lat) formData.append("location_lat", postLocation.lat);
                if (postLocation.lon) formData.append("location_lon", postLocation.lon);
            }
            if (postImage) formData.append("image", postImage);
            if (postVideo) formData.append("video", postVideo);

            if (taggedPets.length > 0) {
                formData.append("tagged_pets", JSON.stringify(taggedPets.map(p => p.id)));
            }

            const res = await window.axios.post("/api/posts", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const createdPost = res.data;
            const mapped = {
                id: createdPost.id,
                author: createdPost.pet?.name || user?.name || "You",
                breed: createdPost.pet?.breed || "Pet",
                location: createdPost.location || "",
                avatar: createdPost.pet?.image_url || user?.avatar_url || "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png",
                time: "just now",
                content: createdPost.caption || trimmed,
                hashtags: (createdPost.caption?.match(/#\w+/g) || []),
                image: createdPost.image_url || null,
                video: createdPost.video_url || null,
                likes: 0,
                comments: 0,
                isLiked: false,
                tagged_pets: createdPost.tagged_pets || []
            };

            setPosts((prev) => [mapped, ...prev]);
            setPostText("");
            clearMedia();
            setPostLocation(null);
            setTaggedPets([]);
            setExpanded(false);
            
            // If it's a contest entry, refresh the count
            if (trimmed.includes('#springcutest')) {
                const countRes = await window.axios.get("/api/posts?hashtag=springcutest");
                setContestEntryCount(countRes.data?.total || 0);
            }

        } catch (err) {
            console.error("Post error:", err);
            const message = err.response?.data?.message || "Failed to post. Please check your connection and try again.";
            alert(message);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="pawtastic-feed">
            <Sidebar />

            <main className="feed-main">
                <div className="feed-page-header">
                    <h1 className="feed-page-header__title">Home Feed</h1>
                    <p className="feed-page-header__sub">See what your pet community is up to 🐾</p>
                </div>

                <div className="feed-layout">
                    <div className="feed-center">
                        
                        {/* Stories */}
                        <div className="feed-stories-container">
                            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*,video/*" onChange={handleFileChange} />
                            <div className="feed-stories">
                                <div className="feed-story-wrap">
                                    <div className="feed-story" onClick={handleAddClick} style={{ cursor: 'pointer' }}>
                                        <div className="feed-story__ring feed-story__ring--add">
                                            <div className="feed-story__img-box">
                                                <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Me')}&background=898AA6&color=fff`} alt="Me" />
                                            </div>
                                            <div className="feed-story__plus"><Plus weight="bold" /></div>
                                        </div>
                                        <span className="feed-story__label">Add Story</span>
                                    </div>
                                </div>

                                {visibleStories.map(group => {
                                    return (
                                        <div key={group.user.id} className="feed-story" onClick={() => openViewer(group)}>
                                            <div className="feed-story__ring">
                                                <div className="feed-story__img-box">
                                                    <img
                                                        src={group.user.avatar_url || group.latest_story.media_url}
                                                        alt="Story"
                                                        onError={() => setHiddenStoryUsers((prev) => [...new Set([...prev, group.user.id])])}
                                                    />
                                                </div>
                                            </div>
                                            <span className="feed-story__label">{(group.user.pet?.name || group.user.name?.split(' ')[0] || 'Unknown')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Story Viewer */}
                        <AnimatePresence>
                            {viewerState.isOpen && (
                                <div className="story-viewer-v2">
                                    <div className="story-viewer-v2__bg" onClick={() => setViewerState(p => ({ ...p, isOpen: false }))} />
                                    <div className="story-viewer-v2__main" onClick={(e) => e.stopPropagation()}>
                                        {/* Progress Bars */}
                                        <div className="story-viewer-v2__progress-bars">
                                            {viewerState.userStories.map((_, idx) => (
                                                <div key={idx} className="story-progress-bg">
                                                    <div 
                                                        className="story-progress-fill" 
                                                        style={{ 
                                                            width: idx < viewerState.currentIndex ? '100%' : (idx === viewerState.currentIndex ? `${storyProgress}%` : '0%') 
                                                        }} 
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="story-viewer-v2__header">
                                            <div className="story-viewer-v2__user">
                                                <Avatar src={viewerState.userStories[viewerState.currentIndex].user?.avatar_url} size="sm" />
                                                <div className="user-info">
                                                    <div className="top-line">
                                                        <span className="name">
                                                            {viewerState.userStories[viewerState.currentIndex].user?.pet?.name || viewerState.userStories[viewerState.currentIndex].user?.name}
                                                        </span>
                                                        <span className="time">
                                                            {(() => {
                                                                const diff = Math.floor((new Date() - new Date(viewerState.userStories[viewerState.currentIndex].created_at)) / 1000);
                                                                if (diff < 60) return `${diff}s`;
                                                                if (diff < 3600) return `${Math.floor(diff / 60)}m`;
                                                                if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
                                                                return new Date(viewerState.userStories[viewerState.currentIndex].created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <div className="visibility-icon">
                                                        {viewerState.userStories[viewerState.currentIndex].visibility === 'public' ? (
                                                            <Globe size={14} weight="bold" />
                                                        ) : (
                                                            <Users size={14} weight="bold" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="story-viewer-v2__actions">
                                                {user && viewerState.userStories[viewerState.currentIndex].user?.id === user.id && (
                                                    <div className="story-options-trigger" ref={storyMenuRef}>
                                                        <button className="dots-btn" onClick={() => setShowStoryMenu(!showStoryMenu)}>
                                                            <DotsThree size={28} weight="bold" />
                                                        </button>
                                                        <AnimatePresence>
                                                            {showStoryMenu && (
                                                                <motion.div 
                                                                    className="story-menu"
                                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                >
                                                                    {!showVisibilitySubmenu ? (
                                                                        <>
                                                                            <button onClick={() => handleDeleteStory(viewerState.userStories[viewerState.currentIndex].id)} className="delete">
                                                                                <Trash size={18} /> <span>Delete Story</span>
                                                                            </button>
                                                                            <button onClick={() => handleSaveStory(viewerState.userStories[viewerState.currentIndex])}>
                                                                                <Download size={18} /> <span>Save</span>
                                                                            </button>
                                                                            <button onClick={() => setShowVisibilitySubmenu(true)} className="has-submenu">
                                                                                <Users size={18} /> <span>Story Privacy</span> <CaretRight size={14} />
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <div className="visibility-submenu">
                                                                            <button className="submenu-header" onClick={() => setShowVisibilitySubmenu(false)}>
                                                                                <CaretLeft size={14} /> <span>Back</span>
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleUpdateVisibility(viewerState.userStories[viewerState.currentIndex].id, 'public')}
                                                                                className={viewerState.userStories[viewerState.currentIndex].visibility === 'public' ? 'active' : ''}
                                                                            >
                                                                                <Globe size={18} /> <span>Public</span>
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleUpdateVisibility(viewerState.userStories[viewerState.currentIndex].id, 'followers')}
                                                                                className={viewerState.userStories[viewerState.currentIndex].visibility === 'followers' ? 'active' : ''}
                                                                            >
                                                                                <Users size={18} /> <span>Followers only</span>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                                <button className="close-btn" onClick={() => setViewerState(p => ({ ...p, isOpen: false }))}>
                                                    <X size={28} weight="bold" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="story-viewer-v2__body">
                                            {viewerState.userStories[viewerState.currentIndex].media_type === 'video' ? (
                                                <video src={viewerState.userStories[viewerState.currentIndex].media_url} autoPlay controls />
                                            ) : (
                                                <img src={viewerState.userStories[viewerState.currentIndex].media_url} alt="Story" />
                                            )}
                                        </div>

                                        {/* Owner Footer */}
                                        {user && viewerState.userStories[viewerState.currentIndex].user?.id === user.id && (
                                            <div className="story-viewer-v2__footer">
                                                <div className="footer-item" onClick={() => alert("Viewing insights...")}>
                                                    <div className="icon-circle">
                                                        <Users size={20} weight="bold" />
                                                    </div>
                                                    <span>Viewers</span>
                                                </div>
                                                <div className="footer-item" onClick={() => alert("Added to Highlights!")}>
                                                    <div className="icon-circle">
                                                        <Heart size={20} weight="bold" />
                                                    </div>
                                                    <span>Highlights</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Navigation Arrows */}
                                    <button className="nav-arrow prev" onClick={prevStory} style={{ display: viewerState.currentIndex === 0 ? 'none' : 'flex' }}>
                                        <CaretLeft size={32} weight="bold" />
                                    </button>
                                    <button className="nav-arrow next" onClick={nextStory}>
                                        <CaretRight size={32} weight="bold" />
                                    </button>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Create Post */}
                        <Card innerRef={createCardRef} className="feed-composer">
                            <input type="file" ref={imageInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImageChange} />
                            <input type="file" ref={videoInputRef} style={{ display: "none" }} accept="video/*" onChange={handleVideoChange} />

                            {!isCreateExpanded ? (
                                <div className="feed-composer__trigger-row" onClick={() => setExpanded(true)}>
                                    <Avatar src={user?.avatar_url} fallback={user?.name || 'Me'} size="md" />
                                    <div className="feed-composer__trigger-text">Share a moment with your pet...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="feed-composer__header-row">
                                        <Avatar src={user?.avatar_url} fallback={user?.name || 'Me'} size="md" />
                                        <div className="feed-composer__user-info">
                                            <span className="feed-composer__username">{user?.pet?.name || user?.name || "You"}</span>
                                            <div className="feed-composer__privacy-wrapper" ref={privacyMenuRef}>
                                                <button 
                                                    className="feed-composer__privacy"
                                                    onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                                                >
                                                    {postPrivacy === "public" && <><Globe size={12} /> Public</>}
                                                    {postPrivacy === "friends" && <><Users size={12} /> Friends</>}
                                                    {postPrivacy === "followers" && <><User size={12} /> Followers</>}
                                                    <CaretDown size={10} />
                                                </button>
                                                {showPrivacyMenu && (
                                                    <div className="privacy-menu">
                                                        <button 
                                                            className={`privacy-option ${postPrivacy === "public" ? "active" : ""}`}
                                                            onClick={() => { setPostPrivacy("public"); setShowPrivacyMenu(false); }}
                                                        >
                                                            <Globe size={16} />
                                                            <div className="privacy-info">
                                                                <span className="label">Public</span>
                                                                <span className="desc">Anyone can see your post</span>
                                                            </div>
                                                        </button>
                                                        <button 
                                                            className={`privacy-option ${postPrivacy === "friends" ? "active" : ""}`}
                                                            onClick={() => { setPostPrivacy("friends"); setShowPrivacyMenu(false); }}
                                                        >
                                                            <Users size={16} />
                                                            <div className="privacy-info">
                                                                <span className="label">Friends</span>
                                                                <span className="desc">Only your friends can see</span>
                                                            </div>
                                                        </button>
                                                        <button 
                                                            className={`privacy-option ${postPrivacy === "followers" ? "active" : ""}`}
                                                            onClick={() => { setPostPrivacy("followers"); setShowPrivacyMenu(false); }}
                                                        >
                                                            <User size={16} />
                                                            <div className="privacy-info">
                                                                <span className="label">Followers</span>
                                                                <span className="desc">Only your followers can see</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <textarea
                                        className="feed-composer__textarea"
                                        placeholder="Share a moment with your pet..."
                                        value={postText}
                                        onChange={e => {
                                            setPostText(e.target.value);
                                        }}
                                        rows={2}
                                        autoFocus
                                    />

                                    {(imagePreview || videoPreview) && (
                                        <div className="feed-composer__media-preview">
                                            {imagePreview && <img src={imagePreview} alt="Preview" />}
                                            {videoPreview && <video src={videoPreview} controls />}
                                            <button className="feed-composer__media-clear" onClick={clearMedia}><X size={14} weight="bold" /></button>
                                        </div>
                                    )}

                                    <div className="feed-composer__divider" />

                                    <div className="feed-composer__actions">
                                        <div className="group">
                                            <button className="action-btn" onClick={handleImageClick}><ImageIcon size={18} /> Photo</button>
                                            <button className="action-btn" onClick={handleVideoClick}><Video size={18} /> Video</button>
                                            <button className={`action-btn ${taggedPets.length > 0 ? 'active' : ''}`} onClick={handleTagClick}>
                                                <At size={18} /> 
                                                {taggedPets.length > 0 ? `${taggedPets.length} Tagged` : "Tag"}
                                            </button>
                                            <button className={`action-btn ${postLocation ? 'active' : ''} ${isLocating ? 'loading' : ''}`} onClick={handleLocationClick} disabled={isLocating}>
                                                <MapPin size={18} /> 
                                                {isLocating ? "Locating..." : postLocation?.name || "Location"}
                                            </button>
                                        </div>
                                        <div className="group-right">
                                            <button
                                                className={`post-submit-btn ${(postText.trim().length > 0 || imagePreview || videoPreview) ? 'active' : ''}`}
                                                onClick={submitPost}
                                                disabled={isPosting || (!postText.trim() && !imagePreview && !videoPreview)}
                                            >
                                                <PaperPlaneRight weight="fill" size={16} /> Post
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>

                        {/* Filter Indicator */}
                        {filterTag && (
                            <div className="feed-filter-indicator">
                                <Card className="filter-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', marginBottom: '20px', background: 'rgba(233, 30, 140, 0.1)', border: '1px solid rgba(233, 30, 140, 0.2)' }}>
                                    <div className="filter-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <TrendUp size={20} weight="fill" color="#e91e8c" />
                                        <span>Showing results for <strong>#{filterTag}</strong></span>
                                    </div>
                                    <button className="clear-filter" onClick={() => setFilterTag(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <X size={18} />
                                    </button>
                                </Card>
                            </div>
                        )}

                        {/* Posts List */}
                        <div className="feed-post-list">
                            {posts.map(post => {
                                const isTruncated = post.content.length > 150;
                                return (
                                <Card key={post.id} className="feed-post-v2">
                                    <div className="feed-post-v2__header">
                                        <div className="user">
                                            <Avatar src={post.avatar} size="md" online={true} />
                                            <div className="meta">
                                                <div className="meta-top">
                                                    <span className="name">{post.author}</span>
                                                    {post.tagged_pets && post.tagged_pets.length > 0 && (
                                                        <span className="tagged-info" style={{fontSize: '13px', color: 'var(--text-muted)', marginLeft: '4px'}}>
                                                            {" with "}
                                                            <strong style={{color: 'var(--text-main)'}}>{post.tagged_pets[0].name || "a friend"}</strong>
                                                            {post.tagged_pets.length > 1 && ` and ${post.tagged_pets.length - 1} others`}
                                                        </span>
                                                    )}
                                                    <span className="time">{post.time}</span>
                                                </div>
                                                <div className="meta-bottom">
                                                    <span className="breed">{post.breed}</span>
                                                    {post.location && (
                                                        <span className="location">
                                                            <MapPin size={12} weight="fill" /> {post.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="actions">
                                            <PostMenu postId={post.id} />
                                        </div>
                                    </div>
                                    <div className="feed-post-v2__body" onClick={() => setActivePost(post)} style={{cursor: 'pointer'}}>
                                        <div className="post-text">
                                            {isTruncated ? (
                                                <>
                                                    {post.content} <span className="text-more">less</span>
                                                </>
                                            ) : (
                                                post.content
                                            )}
                                        </div>
                                        {post.hashtags && post.hashtags.length > 0 && (
                                            <div className="hashtags">
                                                {post.hashtags.map(tag => (
                                                    <span 
                                                        key={tag} 
                                                        onClick={(e) => { e.stopPropagation(); setFilterTag(tag.replace('#', '')); }}
                                                        className="hashtag-pill clickable"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {post.video && (
                                            <video src={post.video} controls className="main-video" />
                                        )}
                                        {post.image && !post.video && <img src={post.image} alt="Post content" className="main-img" />}
                                    </div>
                                    <div className="feed-post-v2__footer">
                                        <button className={`action-btn ${post.isLiked ? 'active' : ''}`} onClick={() => toggleLike(post.id)}>
                                            <Heart size={20} weight={post.isLiked ? "fill" : "bold"} />
                                            <span>{post.likes}</span>
                                        </button>
                                        <button className="action-btn">
                                            <ChatCircle size={20} weight="bold" />
                                            <span>{post.comments}</span>
                                        </button>
                                        <button className="action-btn">
                                            <ShareNetwork size={20} weight="bold" />
                                        </button>
                                    </div>
                                </Card>
                            )})}
                        </div>
                    </div>

                    <aside className="feed-right-col">
                        <Card className="sidebar-card">
                            <div className="sidebar-card__title"><TrendUp /> <span>Trending Tags</span></div>
                            <div className="tag-list">
                                <div className="tag-row clickable" onClick={() => setFilterTag("springcutest")}>
                                    <span>1&nbsp;&nbsp;#springcutest</span> <span className="count">NEW</span>
                                </div>
                                <div className="tag-row clickable" onClick={() => setFilterTag("goldenretriever")}>
                                    <span>2&nbsp;&nbsp;#goldenretriever</span> <span className="count">2.4k</span>
                                </div>
                                <div className="tag-row clickable" onClick={() => setFilterTag("catstagram")}>
                                    <span>3&nbsp;&nbsp;#catstagram</span> <span className="count">1.8k</span>
                                </div>
                                <div className="tag-row clickable" onClick={() => setFilterTag("zoomies")}>
                                    <span>4&nbsp;&nbsp;#zoomies</span> <span className="count">980</span>
                                </div>
                                <div className="tag-row clickable" onClick={() => setFilterTag("petlife")}>
                                    <span>5&nbsp;&nbsp;#petlife</span> <span className="count">5.6k</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="sidebar-card">
                            <div className="sidebar-card__title"><Trophy /> <span>Live Contest</span></div>
                            <div 
                                className="live-contest clickable" 
                                onClick={() => window.location.href = '/badges?enterContest=true'}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="live-contest__top">
                                    <div>
                                        <div className="contest-name">Spring Cutest Pet</div>
                                        <div className="contest-sub">Ends in 2 days · {contestEntryCount} entries</div>
                                    </div>
                                    <span className="live-pill">LIVE</span>
                                </div>
                                <div className="contest-progress">
                                    <div className="contest-progress__bar" />
                                </div>
                                <Button variant="primary" className="contest-btn">Enter Contest</Button>
                            </div>
                        </Card>

                        <Card className="sidebar-card">
                            <div className="sidebar-card__title sidebar-card__title--between">
                                <span className="title-left"><Users /> <span>Suggested Pets</span></span>
                                <button className="see-all-btn" onClick={() => { setIsSeeAllPetsOpen(true); fetchSuggestedPets(true); }}>See all</button>
                            </div>
                            <div className="suggested-users">
                                {suggestedPets.length === 0 ? (
                                    <div className="empty-suggested">No suggestions yet</div>
                                ) : (
                                    suggestedPets.slice(0, 3).map(pet => (
                                        <div className="user-row" key={pet.id}>
                                            <Avatar src={pet.image_url || "https://c.animaapp.com/mnucpod10UwxJn/img/ai_4.png"} size="md" />
                                            <div className="info"><span className="name">{pet.name}</span><span className="sub">{pet.breed}</span></div>
                                            <button 
                                                className={`follow-btn ${pet.is_following ? 'following' : ''}`}
                                                onClick={() => handleFollow(pet.id)}
                                            >
                                                {pet.is_following ? 'Following' : 'Follow'}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </aside>
                </div>
            </main>

            <AnimatePresence>
                {activePost && (
                    <PostModal post={activePost} onClose={() => setActivePost(null)} onLike={toggleLike} />
                )}
            </AnimatePresence>

            {/* Location Picker Modal */}
            <AnimatePresence>
                {isLocationPickerOpen && (
                    <motion.div
                        className="location-picker-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="location-picker"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="location-picker__header">
                                <button className="back-btn" onClick={() => setIsLocationPickerOpen(false)}>
                                    <CaretLeft size={24} weight="bold" />
                                </button>
                                <h3>Search for location</h3>
                            </div>

                            <div className="location-picker__search">
                                <div className="search-input-wrapper">
                                    <MagnifyingGlass size={18} weight="bold" />
                                    <input
                                        type="text"
                                        placeholder="Where are you?"
                                        value={locationSearchQuery}
                                        onChange={(e) => {
                                            setLocationSearchQuery(e.target.value);
                                            searchLocations(e.target.value);
                                        }}
                                    />
                                    {locationSearchQuery && (
                                        <button className="clear-search" onClick={() => setLocationSearchQuery("")}>
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="location-picker__content">
                                <h4 className="suggested-title">Suggested</h4>
                                {isLocating ? (
                                    <div className="loading-locations">Finding nearby places...</div>
                                ) : (
                                    <div className="locations-list">
                                        {suggestedLocations.map((loc) => (
                                            <button key={loc.id} className="location-item" onClick={() => { setPostLocation(loc); setIsLocationPickerOpen(false); }}>
                                                <div className="location-icon">
                                                    <MapPin size={20} weight="fill" />
                                                </div>
                                                <div className="location-info">
                                                    <span className="location-name">{loc.name}</span>
                                                    <span className="location-sub">{loc.sub}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tag Picker Modal */}
            <AnimatePresence>
                {isTagPickerOpen && (
                    <motion.div
                        className="location-picker-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="location-picker"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="location-picker__header">
                                <button className="back-btn" onClick={() => setIsTagPickerOpen(false)}>
                                    <CaretLeft size={24} weight="bold" />
                                </button>
                                <h3>Tag people</h3>
                                <button className="done-btn" onClick={() => setIsTagPickerOpen(false)}>Done</button>
                            </div>

                            <div className="location-picker__search">
                                <div className="search-input-wrapper">
                                    <MagnifyingGlass size={18} weight="bold" />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={petSearchQuery}
                                        onChange={(e) => {
                                            setPetSearchQuery(e.target.value);
                                            searchPets(e.target.value);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="location-picker__content">
                                <h4 className="suggested-title">SUGGESTIONS</h4>
                                {isSearchingPets ? (
                                    <div className="loading-locations">Searching pets...</div>
                                ) : (
                                    <div className="locations-list">
                                        {suggestedPets.map((pet) => (
                                            <button 
                                                key={pet.id} 
                                                className={`location-item pet-item ${taggedPets.some(p => p.id === pet.id) ? 'selected' : ''}`} 
                                                onClick={() => toggleTagPet(pet)}
                                            >
                                                <Avatar src={pet.image_url} size="sm" />
                                                <div className="location-info">
                                                    <span className="location-name">{pet.name}</span>
                                                    <span className="location-sub">{pet.breed}</span>
                                                </div>
                                                <div className="selection-indicator">
                                                    {taggedPets.some(p => p.id === pet.id) && <ShieldCheck size={20} weight="fill" color="#e91e8c" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* See All Pets Modal */}
            <AnimatePresence>
                {isSeeAllPetsOpen && (
                    <motion.div
                        className="location-picker-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="location-picker"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="location-picker__header">
                                <button className="back-btn" onClick={() => setIsSeeAllPetsOpen(false)}>
                                    <CaretLeft size={24} weight="bold" />
                                </button>
                                <h3>Suggested Pets</h3>
                            </div>

                            <div className="location-picker__content">
                                <div className="locations-list">
                                    {suggestedPets.map((pet) => (
                                        <div key={pet.id} className="location-item pet-item" style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}>
                                            <Avatar src={pet.image_url} size="sm" />
                                            <div className="location-info">
                                                <span className="location-name">{pet.name}</span>
                                                <span className="location-sub">{pet.breed}</span>
                                            </div>
                                            <button 
                                                className={`follow-btn ${pet.is_following ? 'following' : ''}`}
                                                style={{ marginLeft: 'auto', background: pet.is_following ? 'var(--bg-card)' : 'var(--primary-action)', color: pet.is_following ? 'var(--text-main)' : 'white', border: pet.is_following ? '1px solid var(--border-color)' : 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}
                                                onClick={() => handleFollow(pet.id)}
                                            >
                                                {pet.is_following ? 'Following' : 'Follow'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Feed;
