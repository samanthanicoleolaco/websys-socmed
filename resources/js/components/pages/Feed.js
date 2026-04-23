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
} from "@phosphor-icons/react";
import Sidebar from "./Sidebar";
import "../../../sass/pages/feed.scss";

// ── Micro components ──────────────────────────────────────────────────
const Avatar = ({ src, fallback, size = "md", online = false }) => (
    <div className={`feed-avatar feed-avatar--${size} ${online ? "online" : ""}`}>
        {src ? <img src={src} alt="avatar" /> : <span className="feed-avatar__fallback">{fallback}</span>}
        {online && <span className="feed-avatar__dot" />}
    </div>
);

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

const PostModal = ({ post, onClose, onLike }) => {
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
                            <div className="empty-state">
                                <span>No comments yet.</span>
                                <span>Start the conversation.</span>
                            </div>
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
                        <div className="likes-count">{post.likes} likes</div>
                        <div className="add-comment">
                            <input type="text" placeholder="Add a comment..." />
                            <button className="post-btn">Post</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [dynamicStories, setStories]    = useState([]);
    const [hiddenStoryUsers, setHiddenStoryUsers] = useState([]);
    const [userPet, setUserPet]           = useState(null);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [viewerState, setViewerState]   = useState({ isOpen: false, userStories: [], currentIndex: 0 });
    const [postText, setPostText]         = useState("");
    const [isCreateExpanded, setExpanded] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [activePost, setActivePost] = useState(null);
    const [postPrivacy, setPostPrivacy] = useState("public");
    const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
    const [postLocation, setPostLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [locationSearchQuery, setLocationSearchQuery] = useState("");
    const [suggestedLocations, setSuggestedLocations] = useState([]);
    const privacyMenuRef = useRef(null);
    
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const addMenuRef   = useRef(null);
    const createCardRef = useRef(null);

    const [postImage, setPostImage] = useState(null);
    const [postVideo, setPostVideo] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [storiesRes, petsRes, postsRes] = await Promise.all([
                    window.axios.get("/api/stories"),
                    window.axios.get("/api/pets"),
                    window.axios.get("/api/posts")
                ]);
                setStories(storiesRes.data);
                if (petsRes.data && petsRes.data.length > 0) {
                    setUserPet(petsRes.data[0]);
                }
                const mappedPosts = (postsRes.data?.data || postsRes.data || []).map((p) => ({
                    id: p.id,
                    author: p.pet?.name || p.user?.name || "Petverse User",
                    breed: p.pet?.breed || "Pet",
                    location: p.location || "",
                    avatar: p.pet?.image_url || p.user?.avatar_url || "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png",
                    time: p.created_at ? new Date(p.created_at).toLocaleDateString() : "just now",
                    content: p.caption || p.content || "",
                    hashtags: [],
                    image: p.image_url || p.media_url || null,
                    video: p.video_url || null,
                    likes: Array.isArray(p.likes) ? p.likes.length : (p.likes_count || p.like_count || 0),
                    comments: Array.isArray(p.comments) ? p.comments.length : (p.comments_count || p.comment_count || 0),
                    isLiked: false,
                }));
                setPosts(mappedPosts.length ? mappedPosts : [
                    {
                        id: 1,
                        author: "Sarah & Mochi",
                        breed: "Golden Retriever",
                        location: "Riverside Park",
                        avatar: "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png",
                        time: "2h ago",
                        content: "Golden hour with my best boy Mochi! 🌅🐾 He loves afternoon walks in the park. Every day is a new adventure with this fluff...",
                        hashtags: ["#goldenretriever", "#doglife", "#goldenhour"],
                        image: "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png",
                        likes: 142,
                        comments: 18,
                        isLiked: false,
                    },
                ]);
            } catch (err) { console.error(err); }
        };
        fetchInitialData();
    }, []);

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

    const handleImageClick = () => imageInputRef.current?.click();
    const handleVideoClick = () => videoInputRef.current?.click();

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

    const openViewer = (group) => setViewerState({ isOpen: true, userStories: group.stories, currentIndex: 0 });
    const nextStory = () => {
        if (viewerState.currentIndex < viewerState.userStories.length - 1) {
            setViewerState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
        } else {
            setViewerState(prev => ({ ...prev, isOpen: false }));
        }
    };
    const prevStory = () => { if (viewerState.currentIndex > 0) setViewerState(p => ({ ...p, currentIndex: p.currentIndex - 1 })); };

    useEffect(() => {
        let timer;
        if (viewerState.isOpen && viewerState.userStories[viewerState.currentIndex]?.media_type === 'image') {
            timer = setTimeout(nextStory, 5000);
        }
        return () => clearTimeout(timer);
    }, [viewerState.isOpen, viewerState.currentIndex]);

    useEffect(() => {
        const h = (e) => {
            if (addMenuRef.current && !addMenuRef.current.contains(e.target)) setIsAddMenuOpen(false);
            if (privacyMenuRef.current && !privacyMenuRef.current.contains(e.target)) setShowPrivacyMenu(false);
            // Only collapse if clicking outside AND no content/media to preserve
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
        if (activePost && activePost.id === id) {
            setActivePost(prev => ({ ...prev, isLiked: !prev.isLiked, likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1 }));
        }
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
                if (postLocation.id) formData.append("location_place_id", postLocation.id);
            }
            if (postImage) formData.append("image", postImage);
            if (postVideo) formData.append("video", postVideo);

            let createdPost = null;
            try {
                const res = await window.axios.post("/api/posts", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                createdPost = res.data;
            } catch (e) {
                console.error("Post create failed", e);
            }

            const mapped = createdPost ? {
                id: createdPost.id,
                author: createdPost.pet?.name || createdPost.user?.name || userPet?.name || "You",
                breed: createdPost.pet?.breed || userPet?.breed || "Pet",
                location: createdPost.location || "",
                avatar: createdPost.pet?.image_url || createdPost.user?.avatar_url || userPet?.image_url || "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png",
                time: createdPost.created_at ? new Date(createdPost.created_at).toLocaleDateString() : "just now",
                content: createdPost.caption || createdPost.content || trimmed,
                hashtags: [],
                image: createdPost.image_url || createdPost.media_url || null,
                video: createdPost.video_url || null,
                likes: 0,
                comments: 0,
                isLiked: false,
            } : {
                id: Date.now(),
                author: userPet?.name || "You",
                breed: userPet?.breed || "Pet",
                location: postLocation?.name || "",
                avatar: userPet?.image_url || "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png",
                time: "just now",
                content: trimmed,
                hashtags: [],
                image: imagePreview || null,
                video: videoPreview || null,
                likes: 0,
                comments: 0,
                isLiked: false,
            };

            setPosts((prev) => [mapped, ...prev]);
            setPostText("");
            clearMedia();
            setPostLocation(null);
            setExpanded(false);
        } finally {
            setIsPosting(false);
        }
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
                    // Get current address
                    const reverseRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const reverseData = await reverseRes.json();
                    const addr = reverseData.address || {};
                    
                    // Build accurate address string
                    let cityName = addr.city || addr.town || addr.village || addr.county || "Current Location";
                    let stateName = addr.state || addr.region || "";
                    let countryName = addr.country || "";
                    let roadName = addr.road || addr.pedestrian || addr.street || "";
                    
                    // Build subtitle with City, State or City, Country
                    let currentSub = stateName ? `${cityName}, ${stateName}` : (countryName || "Nearby");
                    
                    const nearby = [
                        { 
                            id: 1, 
                            name: roadName || "Current Location", 
                            sub: currentSub,
                            type: "pin",
                            lat: latitude,
                            lon: longitude
                        },
                        { 
                            id: 2, 
                            name: "My Location", 
                            sub: `${cityName}, ${countryName || ""}`,
                            type: "pin",
                            lat: latitude,
                            lon: longitude
                        },
                    ];
                    
                    // Search for nearby POIs (parks, cafes, etc.) within ~2km
                    const radius = 0.02; // roughly 2km
                    const minLat = latitude - radius;
                    const maxLat = latitude + radius;
                    const minLon = longitude - radius;
                    const maxLon = longitude + radius;
                    
                    // Query for specific amenities nearby
                    const poiQueries = [
                        { q: "park", type: "park" },
                        { q: "cafe", type: "cafe" },
                        { q: "restaurant", type: "cafe" },
                        { q: "shopping mall", type: "shop" },
                        { q: "gym", type: "park" },
                    ];
                    
                    // Try to find nearby places
                    try {
                        const searchPromises = poiQueries.map(poi => 
                            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(poi.q + " near " + cityName)}&limit=2&addressdetails=1&bounded=1&viewbox=${minLon},${maxLat},${maxLon},${minLat}`)
                                .then(r => r.json())
                                .then(data => data.map(item => ({ ...item, iconType: poi.type })))
                        );
                        
                        const poiResults = await Promise.all(searchPromises);
                        const allPois = poiResults.flat().slice(0, 5);
                        
                        allPois.forEach((poi, idx) => {
                            const poiAddr = poi.address || {};
                            const poiName = poi.name || poi.display_name?.split(",")[0];
                            const poiSub = poiAddr.city || poiAddr.town || cityName;
                            
                            if (poiName && !nearby.some(n => n.name === poiName)) {
                                nearby.push({
                                    id: 10 + idx,
                                    name: poiName,
                                    sub: poiSub,
                                    type: poi.iconType || "city",
                                    lat: poi.lat,
                                    lon: poi.lon
                                });
                            }
                        });
                    } catch (e) {
                        // Ignore POI search errors, we already have current location
                    }
                    
                    setSuggestedLocations(nearby);
                } catch {
                    setSuggestedLocations([
                        { id: 1, name: "Current Location", sub: "Nearby", type: "pin" },
                        { id: 2, name: "Local Area", sub: "Nearby", type: "city" },
                    ]);
                } finally {
                    setIsLocating(false);
                }
            },
            () => {
                setSuggestedLocations([
                    { id: 1, name: "Central Park", sub: "Popular location", type: "park" },
                    { id: 2, name: "Downtown", sub: "City Center", type: "city" },
                    { id: 3, name: "Shopping Mall", sub: "Nearby", type: "shop" },
                ]);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const searchLocations = async (query) => {
        if (!query.trim()) {
            fetchNearbyLocations();
            return;
        }
        
        setIsLocating(true);
        try {
            // Build search URL with location bias for better local results
            let searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&extratags=1&namedetails=1`;
            
            // Add location bias if we have user location
            if (navigator.geolocation) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                }).catch(() => null);
                
                if (position) {
                    const { latitude, longitude } = position.coords;
                    // Bias search results toward user's location (within ~50km)
                    searchUrl += `&lat=${latitude}&lon=${longitude}&bounded=1`;
                }
            }
            
            const res = await fetch(searchUrl);
            const data = await res.json();
            
            const results = data.map((item, index) => {
                // Extract detailed address components
                const addr = item.address || {};
                const placeName = item.namedetails?.name || item.name || item.display_name.split(",")[0];
                
                // Build smart subtitle based on place type
                let subtitle = "";
                if (addr.city && addr.state) {
                    subtitle = `${addr.city}, ${addr.state}`;
                } else if (addr.town && addr.state) {
                    subtitle = `${addr.town}, ${addr.state}`;
                } else if (addr.county && addr.state) {
                    subtitle = `${addr.county}, ${addr.state}`;
                } else if (addr.country) {
                    subtitle = `${addr.country}`;
                } else {
                    subtitle = item.display_name.split(",").slice(1, 3).join(", ") || "Nearby";
                }
                
                // Determine place type for icon
                const typeClass = item.extratags?.amenity || item.type || addr.amenity;
                let type = "city";
                if (typeClass === "cafe" || typeClass === "restaurant" || typeClass === "fast_food" || typeClass === "coffee_shop") type = "cafe";
                else if (typeClass === "park" || typeClass === "dog_park" || item.category === "leisure") type = "park";
                else if (typeClass === "shop" || typeClass === "mall" || typeClass === "supermarket" || typeClass === "pet_shop") type = "shop";
                else if (typeClass === "school" || typeClass === "university" || typeClass === "college") type = "school";
                else if (typeClass === "hospital" || typeClass === "clinic" || typeClass === "veterinary") type = "hospital";
                else if (typeClass === "hotel" || typeClass === "hostel") type = "hotel";
                else if (addr.hotel || addr.tourism) type = "hotel";
                
                return {
                    id: item.place_id || index + 1,
                    name: placeName,
                    sub: subtitle,
                    type: type,
                    lat: item.lat,
                    lon: item.lon,
                    fullAddress: item.display_name
                };
            });
            
            setSuggestedLocations(results);
        } catch (err) {
            console.error("Location search error:", err);
            setSuggestedLocations([
                { id: 1, name: query, sub: "Search result", type: "pin" },
            ]);
        } finally {
            setIsLocating(false);
        }
    };

    const selectLocation = (location) => {
        setPostLocation(location);
        setIsLocationPickerOpen(false);
        setLocationSearchQuery("");
    };

    const closeLocationPicker = () => {
        setIsLocationPickerOpen(false);
        setLocationSearchQuery("");
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
                                                <img src={userPet?.image_url || "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png"} alt="Me" />
                                            </div>
                                            <div className="feed-story__plus"><Plus weight="bold" /></div>
                                        </div>
                                        <span className="feed-story__label">Add Story</span>
                                    </div>
                                </div>

                                {visibleStories.map(group => (
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
                                        <span className="feed-story__label">{group.user.pet?.name || group.user.name?.split(' ')[0] || 'Unknown'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Store Viewer */}
                        <AnimatePresence>
                            {viewerState.isOpen && (
                                <div className="story-viewer-v2">
                                    <div className="story-viewer-v2__bg" onClick={() => setViewerState(p => ({ ...p, isOpen: false }))} />
                                    <div className="story-viewer-v2__main">
                                        <div className="story-viewer-v2__header">
                                            <Avatar src={viewerState.userStories[0].user?.avatar_url} size="sm" />
                                            <span className="name">{viewerState.userStories[0].user?.pet?.name || viewerState.userStories[0].user?.name}</span>
                                            <button className="close" onClick={() => setViewerState(p => ({ ...p, isOpen: false }))}><X /></button>
                                        </div>
                                        <div className="story-viewer-v2__body">
                                            {viewerState.userStories[viewerState.currentIndex].media_type === 'video' ? (
                                                <video src={viewerState.userStories[viewerState.currentIndex].media_url} autoPlay controls />
                                            ) : (
                                                <img src={viewerState.userStories[viewerState.currentIndex].media_url} alt="Story" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Create Post */}
                        <Card innerRef={createCardRef} className="feed-composer">
                            <input type="file" ref={imageInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImageChange} />
                            <input type="file" ref={videoInputRef} style={{ display: "none" }} accept="video/*" onChange={handleVideoChange} />

                            {!isCreateExpanded ? (
                                <div className="feed-composer__trigger-row" onClick={() => setExpanded(true)}>
                                    <Avatar src={userPet?.image_url || "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png"} size="md" />
                                    <div className="feed-composer__trigger-text">Share a moment with your pet...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="feed-composer__header-row">
                                        <Avatar src={userPet?.image_url || "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png"} size="md" />
                                        <div className="feed-composer__user-info">
                                            <span className="feed-composer__username">{userPet?.name || "You"}</span>
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
                                            if (e.target.value.length <= 280) {
                                                setPostText(e.target.value);
                                            }
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
                                            <button className="action-btn" onClick={() => {
                                                setPostText(prev => prev + "@");
                                                document.querySelector('.feed-composer__textarea')?.focus();
                                            }}><At size={18} /> Tag</button>
                                            <button className={`action-btn ${postLocation ? 'active' : ''} ${isLocating ? 'loading' : ''}`} onClick={handleLocationClick} disabled={isLocating}>
                                                <MapPin size={18} /> 
                                                {isLocating ? "Locating..." : postLocation?.name || "Location"}
                                            </button>
                                        </div>
                                        <div className="group-right">
                                            <span className="char-count">{postText.length}/280</span>
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
                                                {post.hashtags.map(tag => <span key={tag}>{tag}</span>)}
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
                                <div className="tag-row"><span>1&nbsp;&nbsp;#goldenretriever</span> <span className="count">2.4k</span></div>
                                <div className="tag-row"><span>2&nbsp;&nbsp;#catstagram</span> <span className="count">1.8k</span></div>
                                <div className="tag-row"><span>3&nbsp;&nbsp;#zoomies</span> <span className="count">980</span></div>
                                <div className="tag-row"><span>4&nbsp;&nbsp;#adoptdontshop</span> <span className="count">6.3k</span></div>
                                <div className="tag-row"><span>5&nbsp;&nbsp;#petlife</span> <span className="count">5.6k</span></div>
                            </div>
                        </Card>

                        <Card className="sidebar-card">
                            <div className="sidebar-card__title"><Trophy /> <span>Live Contest</span></div>
                            <div className="live-contest">
                                <div className="live-contest__top">
                                    <div>
                                        <div className="contest-name">Spring Cutest Pet</div>
                                        <div className="contest-sub">Ends in 2 days · 847 entries</div>
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
                                <button className="see-all-btn">See all</button>
                            </div>
                            <div className="suggested-users">
                                <div className="user-row">
                                    <Avatar src="https://c.animaapp.com/mnucpod10UwxJn/img/ai_4.png" size="md" />
                                    <div className="info"><span className="name">Luna</span><span className="sub">12 mutuals</span></div>
                                    <button className="follow-btn">Follow</button>
                                </div>
                                <div className="user-row">
                                    <Avatar src="https://c.animaapp.com/mnucpod10UwxJn/img/ai_3.png" size="md" />
                                    <div className="info"><span className="name">Buddy</span><span className="sub">8 mutuals</span></div>
                                    <button className="follow-btn">Follow</button>
                                </div>
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
                        onClick={closeLocationPicker}
                    >
                        <motion.div
                            className="location-picker"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="location-picker__header">
                                <button className="back-btn" onClick={closeLocationPicker}>
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
                                            if (e.target.value.trim()) {
                                                const timeoutId = setTimeout(() => searchLocations(e.target.value), 300);
                                                return () => clearTimeout(timeoutId);
                                            }
                                        }}
                                    />
                                    {locationSearchQuery && (
                                        <button
                                            className="clear-search"
                                            onClick={() => {
                                                setLocationSearchQuery("");
                                                fetchNearbyLocations();
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="location-picker__content">
                                <h4 className="suggested-title">Suggested</h4>
                                {isLocating ? (
                                    <div className="loading-locations">
                                        <span>Finding nearby places...</span>
                                    </div>
                                ) : (
                                    <div className="locations-list">
                                        {suggestedLocations.map((loc) => (
                                            <button
                                                key={loc.id}
                                                className="location-item"
                                                onClick={() => selectLocation(loc)}
                                            >
                                                <div className="location-icon">
                                                    {loc.type === "park" && <span>🏃</span>}
                                                    {loc.type === "cafe" && <span>☕</span>}
                                                    {loc.type === "shop" && <span>🛍️</span>}
                                                    {loc.type === "pin" && <MapPin size={20} weight="fill" />}
                                                    {loc.type === "city" && <span>🏙️</span>}
                                                    {loc.type === "school" && <span>🎓</span>}
                                                    {loc.type === "hospital" && <span>🏥</span>}
                                                    {loc.type === "hotel" && <span>🏨</span>}
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
        </div>
    );
};

export default Feed;
