import React, { useState, useRef, useEffect } from 'react';
import styles from '../assets/css/MessagesPage.module.css';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSmile, faPaperclip, faImage, faInfoCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker from 'emoji-picker-react';

const MessagesPage = () => {
    const [message, setMessage] = useState("");
    const [selectedConversation, setSelectedConversation] = useState(null);
    const messageInputRef = useRef(null);
    const chatContainerRef = useRef(null); const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    // Mock data for conversations
    const [conversations, setConversations] = useState([
        {
            id: 1,
            username: 'user1',
            avatar: 'http://localhost:8080/storage/avatars/defaultAvatar.jpg',
            lastMessage: 'cam on',
            time: '2h',
            unread: true,
            userId: 101
        },
        {
            id: 2,
            username: 'user2',
            avatar: 'http://localhost:8080/storage/avatars/defaultAvatar.jpg',
            lastMessage: 'minh cung vay',
            time: '1d',
            unread: false,
            userId: 102
        },
        {
            id: 3,
            username: 'user3',
            avatar: 'http://localhost:8080/storage/avatars/defaultAvatar.jpg',
            lastMessage: 'hehe',
            time: '3d',
            unread: false,
            userId: 103
        }
    ]);

    // Mock data for messages in a conversation
    const [mockMessages, setMockMessages] = useState({
        1: [
            {
                id: 1,
                senderId: 101,
                recipientId: 999, // Current user ID
                text: "Hey, how are you?",
                timestamp: "2023-06-01T10:30:00",
                read: true
            },
            {
                id: 2,
                senderId: 999, // Current user ID
                recipientId: 101,
                text: "I'm good! Just working on my social media app. How about you?",
                timestamp: "2023-06-01T10:32:00",
                read: true
            },
            {
                id: 3,
                senderId: 101,
                recipientId: 999,
                text: "That sounds interesting! I'm just relaxing today. What features are you working on?",
                timestamp: "2023-06-01T10:35:00",
                read: true
            },
            {
                id: 4,
                senderId: 999,
                recipientId: 101,
                text: "I'm implementing a real-time chat feature, similar to Instagram's messaging system. It's challenging but fun!",
                timestamp: "2023-06-01T10:40:00",
                read: false
            }
        ],
        2: [
            {
                id: 1,
                senderId: 102,
                recipientId: 999,
                text: "Xin chao",
                timestamp: "2025-05-31T15:20:00",
                read: true
            },
            {
                id: 2,
                senderId: 999,
                recipientId: 102,
                text: "Rat vui duoc gap ban",
                timestamp: "2025-05-31T16:05:00",
                read: true
            },
            {
                id: 3,
                senderId: 102,
                recipientId: 999,
                text: "minh cung vay",
                timestamp: "2025-05-31T16:10:00",
                read: true
            }
        ],
        3: [
            {
                id: 1,
                senderId: 103,
                recipientId: 999,
                text: "Thanks for the info",
                timestamp: "2023-05-29T09:15:00",
                read: true
            },
            {
                id: 2,
                senderId: 999,
                recipientId: 103,
                text: "No problem! Let me know if you need anything else.",
                timestamp: "2023-05-29T09:20:00",
                read: true
            }
        ]
    });

    // Check if device is mobile on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleConversationSelect = (conversationId) => {
        setSelectedConversation(conversationId);

        // Mark conversation as read (update unread status)
        setConversations(prevConversations =>
            prevConversations.map(convo =>
                convo.id === conversationId
                    ? { ...convo, unread: false }
                    : convo
            )
        );

        // Mark all messages in this conversation as read
        setMockMessages(prevMessages => {
            if (!prevMessages[conversationId]) return prevMessages;

            const updatedMessages = prevMessages[conversationId].map(msg =>
                msg.senderId !== 999 ? { ...msg, read: true } : msg
            );

            return {
                ...prevMessages,
                [conversationId]: updatedMessages
            };
        });
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        if (selectedConversation) {
            // In a real app, you would send this message to the backend
            const newMessage = {
                id: mockMessages[selectedConversation].length + 1,
                senderId: 999, // Current user ID
                recipientId: conversations.find(c => c.id === selectedConversation).userId,
                text: message,
                timestamp: new Date().toISOString(),
                read: false
            };

            // Update the mock messages
            setMockMessages(prevMessages => ({
                ...prevMessages,
                [selectedConversation]: [...prevMessages[selectedConversation], newMessage]
            }));

            // Update the last message in conversation list
            setConversations(prevConversations =>
                prevConversations.map(convo =>
                    convo.id === selectedConversation
                        ? { ...convo, lastMessage: message, time: 'Just now' }
                        : convo
                )
            );

            // Clear the input
            setMessage("");

            // Scroll to bottom of chat
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            }, 100);
        }
    }; const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const adjustTextareaHeight = (e) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        setMessage(e.target.value);
    };

    const handleEmojiClick = (emojiObject) => {
        setMessage(prevMessage => prevMessage + emojiObject.emoji);
        setShowEmojiPicker(false);

        // Focus and adjust height after adding emoji
        if (messageInputRef.current) {
            messageInputRef.current.focus();
            setTimeout(() => {
                messageInputRef.current.style.height = 'auto';
                messageInputRef.current.style.height = Math.min(messageInputRef.current.scrollHeight, 120) + 'px';
            }, 0);
        }
    }; const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleAttachment = () => {
        // In a real implementation, this would open a file picker
        alert('Attachment functionality will be implemented in the future.');
    };

    const handleImageUpload = () => {
        // In a real implementation, this would open an image picker
        alert('Image upload functionality will be implemented in the future.');
    };

    // Format timestamp
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date
    const formatMessageDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // Scroll to bottom when conversation changes or new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [selectedConversation, mockMessages]);    // Focus the input when selecting a conversation
    useEffect(() => {
        if (selectedConversation && messageInputRef.current) {
            messageInputRef.current.focus();
        }
    }, [selectedConversation]);

    // Handle click outside emoji picker
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                event.target.className !== styles.iconButton &&
                !event.target.closest(`.${styles.iconButton}`)
            ) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Get the selected conversation data
    const selectedConversationData = selectedConversation
        ? conversations.find(c => c.id === selectedConversation)
        : null;

    // Determine container class for mobile responsive layout
    const containerClass = `${styles.messagesContainer} ${isMobile && !selectedConversation ? styles.showConversationList : ''
        }`;

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={containerClass}>
                    {/* Left Sidebar - Conversation List */}
                    <div className={styles.conversationList}>
                        <div className={styles.conversationHeader}>
                            <h2>Messages</h2>
                            <button className={styles.newMessageBtn}>New</button>
                        </div>

                        <div className={styles.conversations}>
                            {conversations.map(convo => (
                                <div
                                    key={convo.id}
                                    className={`${styles.conversationItem} ${convo.unread ? styles.unread : ''} ${selectedConversation === convo.id ? styles.selected : ''}`}
                                    onClick={() => handleConversationSelect(convo.id)}
                                >
                                    <div className={styles.avatar}>
                                        <img src={convo.avatar} alt={convo.username} />
                                    </div>
                                    <div className={styles.conversationInfo}>
                                        <div className={styles.conversationMeta}>
                                            <span className={styles.username}>{convo.username}</span>
                                            <span className={styles.time}>{convo.time}</span>
                                        </div>
                                        <div className={styles.lastMessage}>
                                            {convo.lastMessage}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Chat Area */}
                    <div className={styles.chatArea}>
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className={styles.chatHeader}>
                                    <div className={styles.recipientInfo}>
                                        {isMobile && (
                                            <button
                                                className={styles.backButton}
                                                onClick={handleBackToList}
                                            >
                                                <FontAwesomeIcon icon={faArrowLeft} />
                                            </button>
                                        )}
                                        <img
                                            src={selectedConversationData.avatar}
                                            alt={selectedConversationData.username}
                                            className={styles.recipientAvatar}
                                        />
                                        <Link to={`/profile/${selectedConversationData.userId}`} className={styles.recipientUsername}>
                                            {selectedConversationData.username}
                                        </Link>
                                    </div>
                                    <button className={styles.viewProfileBtn}>
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                    </button>
                                </div>

                                {/* Chat Messages */}
                                <div className={styles.messagesWrapper} ref={chatContainerRef}>
                                    <div className={styles.messages}>
                                        {mockMessages[selectedConversation].map((message, index) => {
                                            const isCurrentUser = message.senderId === 999;
                                            const messageClass = isCurrentUser ? styles.sentMessage : styles.receivedMessage;

                                            // Check if we need to display a date separator
                                            const showDateSeparator = index === 0 ||
                                                formatMessageDate(message.timestamp) !==
                                                formatMessageDate(mockMessages[selectedConversation][index - 1].timestamp);

                                            return (
                                                <React.Fragment key={message.id}>
                                                    {showDateSeparator && (
                                                        <div className={styles.dateSeparator}>
                                                            <span>{formatMessageDate(message.timestamp)}</span>
                                                        </div>
                                                    )}
                                                    <div className={`${styles.message} ${messageClass}`}>
                                                        {!isCurrentUser && (
                                                            <img
                                                                src={selectedConversationData.avatar}
                                                                alt={selectedConversationData.username}
                                                                className={styles.messageAvatar}
                                                            />
                                                        )}
                                                        <div className={styles.messageContent}>
                                                            <div className={styles.messageText}>
                                                                {message.text}
                                                            </div>
                                                            <div className={styles.messageInfo}>
                                                                <span className={styles.messageTime}>
                                                                    {formatMessageTime(message.timestamp)}
                                                                </span>
                                                                {isCurrentUser && (
                                                                    <span className={styles.messageStatus}>
                                                                        {message.read ? 'Read' : 'Sent'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>                                {/* Chat Input */}
                                <div className={styles.chatInputContainer}>
                                    {showEmojiPicker && (
                                        <div className={styles.emojiPickerContainer} ref={emojiPickerRef}>
                                            <EmojiPicker
                                                onEmojiClick={handleEmojiClick}
                                                width="100%"
                                                height={350}
                                            />
                                        </div>
                                    )}
                                    <div className={styles.chatInputWrapper}>
                                        <div className={styles.chatInputIcons}>                                            <button className={styles.iconButton} onClick={toggleEmojiPicker}>
                                            <FontAwesomeIcon icon={faSmile} />
                                        </button>
                                            <button className={styles.iconButton} onClick={handleAttachment}>
                                                <FontAwesomeIcon icon={faPaperclip} />
                                            </button>
                                            <button className={styles.iconButton} onClick={handleImageUpload}>
                                                <FontAwesomeIcon icon={faImage} />
                                            </button>
                                        </div>                                        <textarea
                                            className={styles.chatInput}
                                            placeholder="Message..."
                                            value={message}
                                            onChange={adjustTextareaHeight}
                                            onKeyDown={handleKeyDown}
                                            ref={messageInputRef}
                                            rows={1}
                                        />
                                        <button
                                            className={styles.sendButton}
                                            onClick={handleSendMessage}
                                            disabled={!message.trim()}
                                        >
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (                            // No conversation selected
                            <div className={styles.noConversation}>
                                <div className={styles.noConversationContent}>
                                    <div className={styles.iconPlaceholder}>
                                        <FontAwesomeIcon icon={faPaperPlane} size="2x" />
                                    </div>
                                    <h3>Your Messages</h3>
                                    <p>Send private photos and messages to a friend or group</p>
                                    <button className={styles.sendMessageBtn}>Send Message</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;


