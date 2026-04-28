import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    PaperPlaneTilt,
    PawPrint,
    ArrowLeft,
    MagnifyingGlass,
    Plus,
    DotsThree,
    ImageSquare,
    MapPin,
    VideoCamera,
    Smiley,
    CheckCircle,
    Users,
    Gear,
    X,
    Phone,
    Paperclip,
    Calendar,
    Check,
} from "@phosphor-icons/react";
import Sidebar from "./Sidebar";
import "../../../sass/pages/messages.scss";

// ── Internal UI Components ─────────────────────────────────────────────

const Avatar = ({ src, fallback, size = "md", online = false, color = null }) => (
    <div
        className={`msg-avatar msg-avatar--${size} ${online ? "msg-avatar--online" : ""}`}
        style={color ? { background: color } : {}}
    >
        {src ? (
            <img src={src} alt="avatar" />
        ) : (
            <span className="msg-avatar__fallback">{fallback}</span>
        )}
        {online && <span className="msg-avatar__dot" />}
    </div>
);

const groupMembers = [
    { id: 1, name: "Sarah", initial: "S", color: "#898AA6" },
    { id: 2, name: "Luna's Mom", initial: "L", color: "#7b9ea6" },
    { id: 3, name: "Buddy's Dad", initial: "B", color: "#a6897b" },
    { id: 4, name: "Max's Owner", initial: "M", color: "#7ba688" },
    { id: 5, name: "Whiskers Fan", initial: "W", color: "#a67bb0" },
];

// ── Component ──────────────────────────────────────────────────────────

const Messages = () => {
    const [activeTab, setActiveTab] = useState("All");
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showBlockPanel, setShowBlockPanel] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [settingsConfig, setSettingsConfig] = useState({
        messageRequests: true,
        readReceipts: true,
        soundNotifications: true
    });

    const toggleSetting = (key) => {
        setSettingsConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };
    const [searchQuery, setSearchQuery] = useState("");
    const [chats, setChats] = useState([]);
    const [requestChats, setRequestChats] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [messages, setMessages] = useState({});
    const messagesEndRef = useRef(null);

    const displayChats = activeTab === "All"
        ? chats.filter((chat) => !chat.archived_at)
        : activeTab === "Archived"
            ? chats.filter((chat) => chat.archived_at)
            : requestChats;

    const fetchConversations = async () => {
        try {
            const res = await window.axios.get('/api/my-conversations');
            const data = res.data || [];
            setChats(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBlocks = async () => {
        try {
            const res = await window.axios.get('/api/blocks');
            setBlockedUsers(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedChat]);

    const handleSend = async () => {
        if (!messageText.trim() || !selectedChat) return;
        try {
            const res = await window.axios.post('/api/my-messages', {
                receiver_id: selectedChat.user_id,
                content: messageText,
            });
            setMessages((prev) => ({
                ...prev,
                [selectedChat.id]: [...(prev[selectedChat.id] || []), res.data],
            }));
            setMessageText("");
            setChats((prev) => prev.map((chat) => chat.id === selectedChat.id
                ? { ...chat, preview: res.data.text, time: "just now", last_message_at: new Date().toISOString() }
                : chat));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectChat = async (chat) => {
        setSelectedChat(chat);
        setShowSettings(false);
        try {
            const res = await window.axios.get(`/api/my-conversations/${chat.id}/messages`);
            const data = res.data || [];
            setMessages((prev) => ({ ...prev, [chat.id]: data }));

            const unread = data.filter((msg) => !msg.isSelf && !msg.is_read);
            await Promise.all(unread.map((msg) => window.axios.post(`/api/messages/${msg.id}/read`)));
            setChats((prev) => prev.map((c) => c.id === chat.id ? { ...c, unread: 0 } : c));
        } catch (err) {
            console.error(err);
        }
    };

    const handleArchiveOldChats = async () => {
        if (!window.confirm('Archive chats inactive for 30 days?')) return;
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const targets = chats.filter((chat) => chat.last_message_at && new Date(chat.last_message_at).getTime() < cutoff);
        try {
            await Promise.all(targets.map((chat) => window.axios.post(`/api/my-conversations/${chat.id}/archive`)));
            setChats((prev) => prev.map((chat) => targets.find((t) => t.id === chat.id)
                ? { ...chat, archived_at: new Date().toISOString() }
                : chat));
            setActiveTab('Archived');
        } catch (err) {
            console.error(err);
        }
    };

    const openBlockPanel = () => {
        setShowBlockPanel(true);
        fetchBlocks();
    };

    const handleUnblock = async (blockId) => {
        try {
            await window.axios.delete(`/api/blocks/${blockId}`);
            setBlockedUsers((prev) => prev.filter((b) => b.id !== blockId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleBlockUser = async (blockedUserId) => {
        try {
            await window.axios.post('/api/blocks', { blocked_user_id: blockedUserId });
            setRequestChats((prev) => prev.filter((c) => c.user_id !== blockedUserId));
            fetchBlocks();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleMember = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    const chatMessages = selectedChat ? messages[selectedChat.id] || [] : [];

    return (
        <div className="messages-page">
            <Sidebar />

            {/* Chat List Pane */}
            <aside className="msg-list-pane">
                <div className="msg-list-pane__header">
                    <h2 className="msg-list-pane__title">Messages</h2>
                    <div className="msg-list-pane__icons">
                        <button className="msg-icon-btn" onClick={() => setShowGroupModal(true)} title="New chat">
                            <Plus size={18} />
                        </button>
                        <div style={{ position: 'relative' }}>
                            <button
                                className={`msg-icon-btn ${showSettings ? "msg-icon-btn--active" : ""}`}
                                onClick={() => setShowSettings(!showSettings)}
                                title="Settings"
                            >
                                <Gear size={18} />
                            </button>

                            {/* Settings Popup Menu */}
                            <AnimatePresence>
                                {showSettings && (
                                    <motion.div
                                        className="msg-settings-popup"
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <p className="msg-settings-popup__label">MESSAGE SETTINGS</p>
                                        <div className="msg-settings-popup__item">
                                            Message Requests
                                            <button 
                                                className={`msg-toggle-switch ${settingsConfig.messageRequests ? 'on' : 'off'}`} 
                                                onClick={() => toggleSetting('messageRequests')}
                                            >
                                                <div className="msg-toggle-switch__thumb" />
                                            </button>
                                        </div>
                                        <div className="msg-settings-popup__item">
                                            Read Receipts
                                            <button 
                                                className={`msg-toggle-switch ${settingsConfig.readReceipts ? 'on' : 'off'}`} 
                                                onClick={() => toggleSetting('readReceipts')}
                                            >
                                                <div className="msg-toggle-switch__thumb" />
                                            </button>
                                        </div>
                                        <div className="msg-settings-popup__item">
                                            Sound Notifications
                                            <button 
                                                className={`msg-toggle-switch ${settingsConfig.soundNotifications ? 'on' : 'off'}`} 
                                                onClick={() => toggleSetting('soundNotifications')}
                                            >
                                                <div className="msg-toggle-switch__thumb" />
                                            </button>
                                        </div>
                                        <div className="msg-settings-popup__divider" />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                                            <button className="msg-settings-popup__link" onClick={handleArchiveOldChats}>Archive old chats</button>
                                            <button className="msg-settings-popup__link" style={{ color: '#ef4444' }} onClick={openBlockPanel}>Block accounts</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="msg-search">
                    <MagnifyingGlass size={16} className="msg-search__icon" />
                    <input
                        className="msg-search__input"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Tabs */}
                <div className="msg-tabs">
                    <button
                        className={`msg-tab ${activeTab === "All" ? "msg-tab--active" : ""}`}
                        onClick={() => setActiveTab("All")}
                    >
                        All
                    </button>
                    <button
                        className={`msg-tab ${activeTab === "Requests" ? "msg-tab--active" : ""}`}
                        onClick={() => setActiveTab("Requests")}
                    >
                        Requests <span className="msg-tab__badge">{requestChats.length}</span>
                    </button>
                    <button
                        className={`msg-tab ${activeTab === "Archived" ? "msg-tab--active" : ""}`}
                        onClick={() => setActiveTab("Archived")}
                    >
                        Archived
                    </button>
                </div>

                {/* Chat Items */}
                <div className="msg-chat-list">
                    {displayChats.map((chat) => (
                        <motion.div
                            key={chat.id}
                            className={`msg-chat-item ${selectedChat?.id === chat.id ? "msg-chat-item--active" : ""} ${chat.isRequest ? "msg-chat-item--request" : ""}`}
                            onClick={() => { handleSelectChat(chat); }}
                            whileHover={{ backgroundColor: "rgba(137,138,166,0.06)" }}
                        >
                            <div className="msg-chat-item__avatar-wrap">
                                <Avatar
                                    src={chat.avatar}
                                    fallback={chat.name[0]}
                                    size="md"
                                    online={chat.online}
                                    color={chat.color}
                                />
                                {chat.isGroup && (
                                    <span className="msg-chat-item__group-badge"><Users size={8} /></span>
                                )}
                            </div>
                            <div className="msg-chat-item__body">
                                <div className="msg-chat-item__top">
                                    <span className={`msg-chat-item__name ${chat.isRequest ? "msg-chat-item__name--request" : ""}`}>
                                        {chat.name}
                                    </span>
                                    {chat.time && <span className="msg-chat-item__time">{chat.time}</span>}
                                </div>
                                <span className="msg-chat-item__preview">{chat.preview}</span>
                            </div>
                            {chat.unread > 0 && (
                                <span className="msg-unread-badge">{chat.unread}</span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </aside>

            {/* Main Chat Pane */}
            <main className="msg-main-pane">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <header className="msg-chat-header">
                            <div className="msg-chat-header__left">
                                <button className="msg-icon-btn msg-back-btn" onClick={() => setSelectedChat(null)}>
                                    <ArrowLeft size={20} />
                                </button>
                                <Avatar src={selectedChat.avatar} fallback={selectedChat.name[0]} size="md" online={selectedChat.online} color={selectedChat.color} />
                                <div>
                                    <p className="msg-chat-header__name">{selectedChat.name}</p>
                                    <p className="msg-chat-header__status">{selectedChat.online ? "Online" : "Offline"}</p>
                                </div>
                            </div>
                            <div className="msg-chat-header__right">
                                <button className="msg-icon-btn"><Phone size={18} /></button>
                                <button className="msg-icon-btn"><VideoCamera size={18} /></button>
                                <button className="msg-icon-btn"><DotsThree size={20} /></button>
                            </div>
                        </header>

                        {/* Messages Viewport */}
                        <div className="msg-viewport">
                            <AnimatePresence>
                                {chatMessages.map((msg, i) => (
                                    <motion.div
                                        key={msg.id || i}
                                        className={`msg-bubble-row ${msg.isSelf ? "msg-bubble-row--self" : "msg-bubble-row--other"}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="msg-bubble">
                                            <p>{msg.text}</p>
                                            <span className="msg-bubble__time">{msg.time}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Row / Request Footer */}
                        {selectedChat.isRequest ? (
                            <footer className="msg-request-footer">
                                <p className="msg-request-footer__text">
                                    If you accept, <strong>{selectedChat.name}</strong> will also be able to call you and may see info like your Active Status and when you've read messages. <span className="msg-request-footer__link">Choose who can message you</span>
                                </p>
                                <div className="msg-request-footer__actions">
                                    <button className="msg-request-btn msg-request-btn--block" onClick={() => handleBlockUser(selectedChat.user_id)}>Block</button>
                                    <button className="msg-request-btn msg-request-btn--delete">Delete</button>
                                    <button className="msg-request-btn msg-request-btn--accept">Accept</button>
                                </div>
                            </footer>
                        ) : (
                            <footer className="msg-input-bar">
                                <button className="msg-icon-btn"><Paperclip size={18} /></button>
                                <input
                                    className="msg-input"
                                    placeholder="Type a message..."
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />
                                <button className="msg-send-btn" onClick={handleSend} disabled={!messageText.trim()}>
                                    <PaperPlaneTilt size={16} weight="fill" />
                                </button>
                            </footer>
                        )}
                    </>
                ) : (
                    /* Empty State */
                    <div className="msg-empty-state">
                        <div className="msg-empty-state__icon">
                            <PawPrint size={48} weight="light" />
                        </div>
                        <h3 className="msg-empty-state__title">Your Messages</h3>
                        <p className="msg-empty-state__sub">Select a conversation or start a new one with a fellow pet lover</p>
                        <button className="msg-empty-state__btn" onClick={() => setShowGroupModal(true)}>
                            <PaperPlaneTilt size={16} /> Send Message
                        </button>
                    </div>
                )}
            </main>

            {/* New Group Chat Modal */}
            <AnimatePresence>
                {showGroupModal && (
                    <motion.div
                        className="msg-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowGroupModal(false)}
                    >
                        <motion.div
                            className="pv-msg-modal"
                            initial={{ scale: 0.94, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.94, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <div className="pv-msg-modal__header">
                                <h3>New message</h3>
                                <button className="msg-icon-btn" onClick={() => setShowGroupModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="pv-msg-modal__search-to" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="to-label">To:</span>
                                <input
                                    className="pv-msg-modal__search-input"
                                    placeholder="Search..."
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    style={{ flex: 1, width: '100%' }}
                                />
                            </div>

                            <div className="pv-msg-modal__body" style={{ display: 'flex', flexDirection: 'column' }}>
                                <p className="pv-msg-modal__section-label">Suggested</p>
                                <div className="pv-msg-modal__member-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {groupMembers.map((m) => {
                                        const isSelected = selectedMembers.includes(m.id);
                                        return (
                                            <button
                                                key={m.id}
                                                className={`pv-msg-modal__member ${isSelected ? "pv-msg-modal__member--selected" : ""}`}
                                                onClick={() => toggleMember(m.id)}
                                            >
                                                <Avatar fallback={m.initial} size="md" color={m.color} />
                                                <div className="pv-msg-modal__member-info">
                                                    <span className="member-name">{m.name}</span>
                                                    <span className="member-username">{m.name.toLowerCase().replace(/\s+/g, '')}</span>
                                                </div>
                                                <div className={`pv-msg-modal__member-radio ${isSelected ? 'selected' : ''}`}>
                                                    {isSelected && <div className="radio-inner" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="pv-msg-modal__footer">
                                <button
                                    className={`pv-msg-modal__create-btn ${selectedMembers.length > 0 ? "pv-msg-modal__create-btn--enabled" : ""}`}
                                    disabled={!selectedMembers.length}
                                >
                                    Chat
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showBlockPanel && (
                    <motion.div
                        className="msg-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowBlockPanel(false)}
                    >
                        <motion.div
                            className="msg-block-modal"
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="msg-block-modal__header">
                                <h3>Blocked accounts</h3>
                                <button className="msg-icon-btn" onClick={() => setShowBlockPanel(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="msg-block-modal__body">
                                {blockedUsers.length === 0 ? (
                                    <p className="msg-block-modal__empty">No blocked accounts.</p>
                                ) : blockedUsers.map((block) => (
                                    <div className="msg-block-row" key={block.id}>
                                        <span className="name">{block.blocked_user?.name || 'User'}</span>
                                        <button className="msg-unblock-btn" onClick={() => handleUnblock(block.id)}>Unblock</button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Messages;
