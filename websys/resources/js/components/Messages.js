import React, { useState, useEffect } from 'react';
import '../../sass/feed.scss';
import '../../sass/messages.scss';
import Sidebar from './Sidebar';

// Reusing Icons + Adding specific Messages icons
const Icons = {
    Home: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    Message: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    Trophy: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10M5 4h14v4a2 2 0 0 1-2 2h-1M6 10H5a2 2 0 0 1-2-2V4M12 17a5 5 0 0 0 5-5V4"></path></svg>,
    Paw: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Setting: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Logout: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Phone: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
    Video: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
    MoreDots: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>,
    MapPin: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
    Calendar: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    FileText: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    Photo: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
    Check: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Paperclip: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>,
    Send: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
};

const Messages = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [isNewConvoModalOpen, setIsNewConvoModalOpen] = useState(false);
    const [buddies, setBuddies] = useState([]);
    const [messagesList, setMessagesList] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

    const [proposeModalOpen, setProposeModalOpen] = useState(false);
    const [proposeDate, setProposeDate] = useState('');
    
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [locInput, setLocInput] = useState('');
    
    const fileInputRef = React.useRef(null);

    const sendSpecialMessage = (prefix, content) => {
        if (!selectedChat) return;
        window.axios.post('/api/my-messages', {
            receiver_id: selectedChat.id,
            content: `${prefix} ${content}`
        }).then(res => {
            setMessagesList([...messagesList, res.data]);
            setChats(chats.map(c => c.id === selectedChat.id ? { ...c, preview: res.data.text, time: res.data.time } : c));
        }).catch(err => console.log(err));
    };

    const handlePhotoUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            sendSpecialMessage('[PHOTO]', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80');
        }
    };

    const clearChatHistory = () => {
        if (!selectedChat || !window.confirm('Are you sure you want to permanently delete this entire conversation from your system?')) return;
        window.axios.delete(`/api/my-conversations/${selectedChat.id}`).then(() => {
            setMessagesList([]);
            setHeaderMenuOpen(false);
            setChats(chats.filter(c => c.id !== selectedChat.id));
            setSelectedChat(null);
        }).catch(err => console.log(err));
    };

    const unsendMessage = (msgId) => {
        if (!window.confirm('Are you sure you want to unsend this message?')) return;
        window.axios.delete(`/api/my-messages/${msgId}`).then(() => {
            setMessagesList(messagesList.filter(m => m.id !== msgId));
            setActiveMenuId(null);
        }).catch(err => console.log(err));
    };

    useEffect(() => {
        // Fetch existing conversations
        window.axios.get('/api/my-conversations')
            .then(res => setChats(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.log(err));

        // Fetch suggested buddies for new convo modal
        window.axios.get('/api/my-conversations/buddies')
            .then(res => setBuddies(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.log(err));
    }, []);

    // Fetch messages when a chat is selected
    useEffect(() => {
        if (selectedChat) {
            window.axios.get(`/api/my-conversations/${selectedChat.id}/messages`)
                .then(res => setMessagesList(Array.isArray(res.data) ? res.data : []))
                .catch(err => console.log(err));
        }
    }, [selectedChat]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedChat) return;

        window.axios.post('/api/my-messages', {
            receiver_id: selectedChat.id,
            content: newMessage
        }).then(res => {
            setMessagesList([...messagesList, res.data]);
            setNewMessage('');
            
            // Also update the chat preview on the left sidebar
            setChats(chats.map(c => {
                if (c.id === selectedChat.id) {
                    return { ...c, preview: res.data.text, time: res.data.time };
                }
                return c;
            }));
        }).catch(err => console.log(err));
    };



    return (
        <div className="pawtastic-feed pawtastic-messages">
            <Sidebar brandText="Pawtastic" />

            {/* Middle Column: Chat List */}
            <div className="messages-list-sidebar">
                <div className="messages-list-header">
                    <h3>Messages</h3>
                    <span className="badge">{chats.length} Chats</span>
                </div>
                
                <div className="messages-search">
                    <div className="search-input-wrapper">
                        <Icons.Search />
                        <input type="text" placeholder="Search playdates..." />
                    </div>
                </div>

                <div className="chat-list">
                    {chats.length === 0 ? (
                        <div className="empty-chats-sidebar">
                            <Icons.Message />
                            <p>No conversations yet.</p>
                            <button className="start-convo-btn-small" onClick={() => setIsNewConvoModalOpen(true)}>Start New</button>
                        </div>
                    ) : (
                        chats.map((chat, idx) => (
                            <div 
                                key={chat.id} 
                                className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                onClick={() => setSelectedChat(chat)}
                            >
                                <div className="chat-avatar" style={{ backgroundColor: chat.bg }}>
                                    {chat.initial}
                                    {idx === 0 && <div className="status-dot"></div>}
                                </div>
                                <div className="chat-info">
                                    <div className="chat-name-row">
                                        <span className="chat-name">{chat.name}</span>
                                        <span className="chat-time">{chat.time}</span>
                                    </div>
                                    <div className="chat-preview">{chat.preview}</div>
                                </div>
                                {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Column: Main Chat */}
            <div className="messages-main-chat">
                {selectedChat ? (
                    <>
                        <div className="chat-header">
                            <div className="header-info-wrapper">
                                <div className="avatar-lg" style={{ backgroundColor: selectedChat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                                    {selectedChat.initial}
                                    <div className="status-dot-lg"></div>
                                </div>
                                <div className="header-text">
                                    <h4>{selectedChat.name.split(' &')[0]}</h4>
                                    <p>Owner: {selectedChat.name.includes('&') ? selectedChat.name.split('& ')[1] : 'Unknown'} • Online</p>
                                </div>
                            </div>
                            <div className="header-actions" style={{ position: 'relative' }}>
                                <button><Icons.Phone /></button>
                                <button><Icons.Video /></button>
                                <button onClick={() => setHeaderMenuOpen(!headerMenuOpen)}><Icons.MoreDots /></button>
                                {headerMenuOpen && (
                                    <div className="msg-dropdown-menu" style={{ top: '100%', right: '0', position: 'absolute', marginTop: '10px', width: '180px' }}>
                                        <div onClick={() => { alert('Pin Chat activated!'); setHeaderMenuOpen(false); }}>Pin Chat</div>
                                        <div onClick={() => { alert('Notifications conditionally muted!'); setHeaderMenuOpen(false); }}>Mute Notifications</div>
                                        <div onClick={clearChatHistory}>Clear Chat History</div>
                                        <div style={{ color: 'red' }} onClick={() => { alert('User reported successfully.'); setHeaderMenuOpen(false); }}>Report User</div>
                                        <div style={{ color: 'red' }} onClick={() => { alert('User blocked.'); setHeaderMenuOpen(false); }}>Block User</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="chat-history">
                            <div className="date-divider">
                                <span>Today</span>
                            </div>

                            {messagesList.length === 0 ? (
                                <div className="empty-history-state" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="empty-conversation-sign" style={{ textAlign: 'center' }}>
                                        <div className="icon-circle" style={{ width: '80px', height: '80px', background: '#FFF4EA', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icons.Paw />
                                        </div>
                                        <h3 style={{ margin: '0 0 10px', fontSize: '22px' }}>Say hi to {selectedChat.name.split(' &')[0]}!</h3>
                                        <p style={{ color: '#7A8B9A', fontSize: '15px' }}>Start a conversation to schedule your next playdate.</p>
                                    </div>
                                </div>
                            ) : (
                                messagesList.map((msg, idx) => (
                                    <div key={msg.id || idx} className={`message-row ${msg.isSelf ? 'right' : 'left'}`}>
                                        {msg.isSelf && (
                                            <div className="message-options-wrapper">
                                                <button className="msg-opt-btn" onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}>⋮</button>
                                                {activeMenuId === msg.id && (
                                                    <div className="msg-dropdown-menu">
                                                        <div onClick={() => unsendMessage(msg.id)}>Unsend</div>
                                                        <div onClick={() => alert('Forward message dialog opened!')}>Forward</div>
                                                        <div onClick={() => alert('Message pinned!')}>Pin</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="bubble-wrapper">
                                            {msg.text.startsWith('[PROPOSAL]') ? (
                                                <div className="proposal-card">
                                                    <div className="proposal-content">
                                                        <div className="proposal-header">
                                                            <div className="icon-box orange"><Icons.Calendar /></div>
                                                            <div className="info">
                                                                <h5>Playdate Proposed!</h5>
                                                                <p>{msg.text.replace('[PROPOSAL] ', '')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="actions">
                                                            <button className="decline-btn" onClick={() => {
                                                                setMessagesList(messagesList.map(m => m.id === msg.id ? { ...m, text: '[REJECTED]' } : m));
                                                            }}>Decline</button>
                                                            <button className="accept-btn" onClick={() => {
                                                                setMessagesList(messagesList.map(m => m.id === msg.id ? { ...m, text: '[ACCEPTED]' } : m));
                                                            }}>Accept</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : msg.text.startsWith('[REJECTED]') ? (
                                                <div className="bubble" style={{background: '#f8d7da', color: '#721c24'}}>Proposal Declined.</div>
                                            ) : msg.text.startsWith('[ACCEPTED]') ? (
                                                <div className="bubble" style={{background: '#d4edda', color: '#155724'}}>Proposal Accepted!</div>
                                            ) : msg.text.startsWith('[LOCATION]') ? (
                                                <div className="proposal-card">
                                                    <div className="proposal-image" style={{ background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Icons.MapPin style={{ width: '40px', height: '40px', color: '#3b82f6' }} />
                                                    </div>
                                                    <div className="proposal-content">
                                                        <div className="proposal-header">
                                                            <div className="icon-box blue"><Icons.MapPin /></div>
                                                            <div className="info">
                                                                <h5>Shared Location</h5>
                                                                <p>{msg.text.replace('[LOCATION] ', '')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="actions">
                                                            <button className="accept-btn" style={{ background: '#3b82f6', borderColor: '#3b82f6' }} 
                                                             onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.text.replace('[LOCATION] ', ''))}`, '_blank')}
                                                            >View on Maps</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : msg.text.startsWith('[PHOTO]') ? (
                                                <div className="proposal-card" style={{ width: '260px' }}>
                                                    <div className="proposal-image" style={{ height: '180px', backgroundImage: `url(${msg.text.replace('[PHOTO] ', '')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bubble">{msg.text}</div>
                                            )}
                                            <div className="timestamp">{msg.time} {msg.isSelf && <Icons.Check />}</div>
                                        </div>
                                        {!msg.isSelf && (
                                            <div className="message-options-wrapper" style={{ left: 0, right: 'auto' }}>
                                                <button className="msg-opt-btn" onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}>⋮</button>
                                                {activeMenuId === msg.id && (
                                                    <div className="msg-dropdown-menu" style={{ right: 'auto', left: '100%' }}>
                                                        <div onClick={() => alert('Reply dialog opened!')}>Reply</div>
                                                        <div onClick={() => alert('Forward message dialog opened!')}>Forward</div>
                                                        <div onClick={() => alert('Message pinned!')}>Pin</div>
                                                        <div style={{color: 'red'}} onClick={() => alert('Message reported.')}>Report</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="chat-input-area">
                            <div className="top-actions">
                                <div className="action-pill orange" onClick={() => setProposeModalOpen(true)}><Icons.FileText /> Propose Time</div>
                                <div className="action-pill blue" onClick={() => setLocationModalOpen(true)}><Icons.MapPin /> Share Location</div>
                                <div className="action-pill" onClick={() => fileInputRef.current.click()}><Icons.Photo /> Send Photo</div>
                                <div className="action-pill" onClick={() => sendSpecialMessage('[PROPOSAL]', 'Scheduled friendly reminder for tomorrow.')}><Icons.Calendar /> Schedule Reminder</div>
                                <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" />
                            </div>                   
                            <div className="input-wrapper">
                                <div className="input-field-container">
                                    <Icons.Paperclip className="paperclip" />
                                    <input 
                                        type="text" 
                                        placeholder="Type a message..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                </div>
                                <button className="send-btn" onClick={handleSendMessage}>
                                    <Icons.Send />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="empty-sign-main">
                            <div className="illustration-wrapper">
                                <Icons.Message />
                            </div>
                            <h2>Your Messages</h2>
                            <p>Select a conversation from the left or start a new one to connect with other pet owners.</p>
                            <button className="start-convo-btn" onClick={() => setIsNewConvoModalOpen(true)}>Start a Conversation</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Start Convo Modal */}
            {isNewConvoModalOpen && (
                <div className="messages-modal-overlay">
                    <div className="new-convo-modal">
                        <div className="modal-header">
                            <h3>Start a New Conversation</h3>
                            <button className="close-btn" onClick={() => setIsNewConvoModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="search-users-box">
                                <Icons.Search />
                                <input type="text" placeholder="Search for a pet or owner..." />
                            </div>
                            <div className="suggested-users-list">
                                {buddies.map(user => (
                                    <div 
                                        key={user.id} 
                                        className="suggested-user-item"
                                        onClick={() => {
                                            const chatExists = chats.find(c => c.id === user.id);
                                            if (!chatExists) {
                                                setChats([user, ...chats]);
                                            }
                                            setSelectedChat(user);
                                            setIsNewConvoModalOpen(false);
                                        }}
                                    >
                                        <div className="avatar" style={{ backgroundColor: user.bg }}>{user.initial}</div>
                                        <div className="user-details">
                                            <h4>{user.name}</h4>
                                            <p>{user.preview}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {proposeModalOpen && (
                <div className="messages-modal-overlay">
                    <div className="new-convo-modal" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Propose a Playdate</h3>
                            <button className="close-btn" onClick={() => setProposeModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>When should we meet?</label>
                            <input type="datetime-local" className="styled-datetime-input" 
                                onChange={(e) => setProposeDate(e.target.value)} />
                            <button className="global-action-btn" onClick={() => {
                                const finalDate = proposeDate ? new Date(proposeDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'sometime this week';
                                sendSpecialMessage('[PROPOSAL]', finalDate);
                                setProposeModalOpen(false);
                            }}>Send Proposal</button>
                        </div>
                    </div>
                </div>
            )}

            {locationModalOpen && (
                <div className="messages-modal-overlay">
                    <div className="new-convo-modal" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Share a Location</h3>
                            <button className="close-btn" onClick={() => setLocationModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Where are we meeting?</label>
                            <input type="text" placeholder="e.g. Central Dog Park, 12th Avenue" style={{ width: '100%', padding: '14px', border: '1px solid #eaeaea', borderRadius: '12px', marginBottom: '20px', fontFamily: 'inherit' }} 
                                onChange={(e) => setLocInput(e.target.value)} />
                            <button className="global-action-btn" style={{ background: '#3b82f6', boxShadow: 'none' }} onClick={() => {
                                if (locInput.trim()) {
                                    sendSpecialMessage('[LOCATION]', locInput);
                                    setLocationModalOpen(false);
                                }
                            }}>Share Pin</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
