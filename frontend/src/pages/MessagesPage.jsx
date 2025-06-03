import React, { useState, useRef, useEffect } from 'react';
import styles from '../assets/css/MessagesPage.module.css';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSmile, faPaperclip, faImage, faInfoCircle, faArrowLeft, faSearch, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker from 'emoji-picker-react';
import UserService from '../services/user.service.jsx';
import AuthService from '../services/auth.service.jsx';
import { useChat } from '../context/ChatContext.jsx';

const MessagesPage = () => {
    const [message, setMessage] = useState("");
    const messageInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
    const DEFAULT_AVATAR = 'defaultAvatar.jpg';
    const currentUser = AuthService.getCurrentUser();

    // New chat popup states
    const [showNewChatPopup, setShowNewChatPopup] = useState(false);
    const [searchUsername, setSearchUsername] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

    // Get chat context
    const {
        chats: conversations,
        activeChat: selectedConversation,
        messages,
        loading,
        error,
        getMessages,
        sendMessage,
        createChat,
        setActiveChat
    } = useChat();



    // Handle conversation selection
    const handleConversationSelect = (conversationId) => {
        // Get messages for this conversation
        getMessages(conversationId);
    };


    // Handle sending messages
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedConversation) return;

        // Send message via context
        sendMessage(selectedConversation, message.trim());

        // Clear the input
        setMessage("");

        // Adjust textarea height
        if (messageInputRef.current) {
            messageInputRef.current.style.height = 'auto';
        }

        // Scroll to bottom of chat
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 100);
    };

    // Handle keyboard events
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    // Adjust textarea height as user types
    const adjustTextareaHeight = (e) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        setMessage(e.target.value);
    };

    // Handle emoji selection
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
    };

    // Toggle emoji picker
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };


    // Format timestamp for messages
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date for message separators
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
            return date.toLocaleDateString();
        }
    };

    // Search for users
    const handleSearchUsers = async (e) => {
        e.preventDefault();
        if (!searchUsername.trim()) return;

        setSearching(true);
        setSearchError("");
        setSelectedUser(null);

        try {
            const response = await UserService.searchUsers(searchUsername.trim());

            if (response && response.users) {
                setSearchResults(response.users);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error searching for users:", error);
            setSearchError("Failed to search for users. Please try again.");
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    // Select user to chat with
    const handleSelectUser = (user) => {
        setSelectedUser(user);
    };    // Create a new chat with selected user
    const handleCreateChat = async () => {
        if (!selectedUser) return;

        try {
            // Show loading indicator if needed
            setSearching(true);

            // Create chat via context
            const newChatId = await createChat(selectedUser.id);

            if (newChatId) {
                console.log("New chat created with ID:", newChatId);
                // Chat was created successfully and added to the list in the ChatContext

                // Close the popup
                setShowNewChatPopup(false);

                // Scroll to bottom of messages when the chat is loaded
                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    }
                }, 300);
            } else {
                console.error("Failed to create chat - no chat ID returned");
                setSearchError("Failed to create conversation. Please try again.");
            }
        } catch (error) {
            console.error("Error creating chat:", error);
            setSearchError("An error occurred while creating the conversation.");
        } finally {
            setSearching(false);
        }
    };

    // Toggle new chat popup
    const toggleNewChatPopup = () => {
        setShowNewChatPopup(!showNewChatPopup);
        if (!showNewChatPopup) {
            // Reset search when opening popup
            setSearchUsername("");
            setSearchResults([]);
            setSelectedUser(null);
            setSearchError("");
        }
    };

    // Scroll to bottom when conversation changes or new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [selectedConversation, messages]);

    // Focus the input when selecting a conversation
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
    // Handle WebSocket message
    // This is handled directly by the ChatContext now
    /*
    const handleNewMessage = (newMessage) => {
        if (!newMessage || !newMessage.chatId) return;

        const chatId = newMessage.chatId;

        // Update messages if this chat is currently selected
        setMessages(prevMessages => {
            if (!prevMessages[chatId]) return prevMessages;

            return {
                ...prevMessages,
                [chatId]: [...(prevMessages[chatId] || []), newMessage]
            };
        });

        // Update conversation list
        setConversations(prevConversations => {
            const updatedConversations = prevConversations.map(convo => {
                if (convo.id === chatId) {
                    return {
                        ...convo,
                        lastMessage: newMessage.content,
                        time: "Just now",
                        // Mark as unread if it's not from current user and not the active conversation
                        unread: newMessage.senderId !== currentUser.user.id && selectedConversation !== chatId
                    };
                }
                return convo;
            });

            // Move the updated conversation to the top
            const convoIndex = updatedConversations.findIndex(c => c.id === chatId);
            if (convoIndex > 0) {
                const [convo] = updatedConversations.splice(convoIndex, 1);
                updatedConversations.unshift(convo);
            }

            return updatedConversations;
        });

        // Mark message as read if the chat is currently selected
        if (selectedConversation === chatId && newMessage.senderId !== currentUser.user.id) {
            // Implement marking as read
        }
    };
    */

    // Format relative time (e.g., "2h ago", "Just now")
    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.messagesContainer}>
                    {/* Left Sidebar - Conversation List */}
                    <div className={styles.conversationList}>
                        <div className={styles.conversationHeader}>
                            <h2>Messages</h2>
                            <button className={styles.newMessageBtn} onClick={toggleNewChatPopup}>New</button>
                        </div>

                        <div className={styles.conversations}>                            {conversations.map(convo => (
                            <div
                                key={convo.id}
                                className={`${styles.conversationItem} 
                                               ${convo.unread ? styles.unread : ''} 
                                               ${selectedConversation === convo.id ? styles.selected : ''}`}
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
                                        <img
                                            src={selectedConversationData.avatar}
                                            alt={selectedConversationData.username}
                                            className={styles.recipientAvatar}
                                        />
                                        <Link to={`/profile/un/${selectedConversationData.username}`} className={styles.recipientUsername}>
                                            {selectedConversationData.username}
                                        </Link>
                                    </div>
                                    <button className={styles.viewProfileBtn}>
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                    </button>
                                </div>                                {/* Chat Messages */}
                                <div className={styles.messagesWrapper} ref={chatContainerRef}>
                                    {loading ? (
                                        <div className={styles.loadingIndicator}>Loading messages...</div>
                                    ) : error ? (
                                        <div className={styles.errorMessage}>{error}</div>
                                    ) : (
                                        <div className={styles.messages}>
                                            {messages[selectedConversation]?.map((message, index) => {
                                                const isCurrentUser = message.senderId === currentUser.user.id;
                                                const messageClass = isCurrentUser ? styles.sentMessage : styles.receivedMessage;
                                                const messageStatus = message.pending ? 'Sending...' : (message.read ? 'Read' : 'Sent');                                                // Check if we need to display a date separator
                                                const showDateSeparator = index === 0 ||
                                                    formatMessageDate(message.sentAt) !==
                                                    formatMessageDate(messages[selectedConversation][index - 1].sentAt); return (
                                                        <React.Fragment key={message.id || `msg-${selectedConversation}-${index}`}>
                                                            {showDateSeparator && (
                                                                <div className={styles.dateSeparator}>
                                                                    <span>{formatMessageDate(message.sentAt)}</span>
                                                                </div>
                                                            )}
                                                            <div className={`${styles.message} ${messageClass} ${message.pending ? styles.pending : ''}`}>
                                                                {!isCurrentUser && (
                                                                    <img
                                                                        src={selectedConversationData.avatar}
                                                                        alt={selectedConversationData.username}
                                                                        className={styles.messageAvatar}
                                                                    />
                                                                )}
                                                                <div className={styles.messageContent}>
                                                                    <div className={styles.messageText}>
                                                                        {message.content}
                                                                    </div>
                                                                    <div className={styles.messageInfo}>
                                                                        <span className={styles.messageTime}>
                                                                            {formatMessageTime(message.sentAt)}
                                                                        </span>
                                                                        {isCurrentUser && (
                                                                            <span className={styles.messageStatus}>
                                                                                {messageStatus}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </React.Fragment>
                                                    );
                                            })}
                                        </div>
                                    )}
                                </div>{/* Chat Input */}
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
                                    <button className={styles.sendMessageBtn} onClick={toggleNewChatPopup}>Send Message</button>
                                </div>
                            </div>
                        )}
                    </div>                </div>
            </div>

            {/* New Chat Popup */}
            {showNewChatPopup && (
                <div className={styles.newChatPopupOverlay}>
                    <div className={styles.newChatPopup}>
                        <div className={styles.newChatHeader}>
                            <h3>New Message</h3>
                            <button
                                className={styles.closePopupBtn}
                                onClick={toggleNewChatPopup}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className={styles.searchContainer}>
                            <form onSubmit={handleSearchUsers}>
                                <div className={styles.searchInputWrapper}>
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder="Search for username..."
                                        value={searchUsername}
                                        onChange={(e) => setSearchUsername(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className={styles.searchButton}
                                        disabled={searching || !searchUsername.trim()}
                                    >
                                        {searching ? (
                                            <span className={styles.loadingSpinner}></span>
                                        ) : (
                                            <FontAwesomeIcon icon={faSearch} />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className={styles.searchResultsContainer}>
                            {searchError && (
                                <div className={styles.searchError}>
                                    {searchError}
                                </div>
                            )}

                            {searchResults.length > 0 ? (
                                <div className={styles.searchResults}>
                                    {searchResults.map(user => (
                                        <div
                                            key={user.id}
                                            className={`${styles.searchResultItem} ${selectedUser && selectedUser.id === user.id ? styles.selected : ''}`}
                                            onClick={() => handleSelectUser(user)}
                                        >
                                            <div className={styles.resultAvatar}>
                                                <img
                                                    src={`${AVATAR_URL}${user.avatar || DEFAULT_AVATAR}`}
                                                    alt={user.username}
                                                />
                                            </div>
                                            <div className={styles.resultInfo}>
                                                <span className={styles.resultUsername}>{user.username}</span>
                                                <span className={styles.resultFullName}>{user.fullName || ''}</span>
                                            </div>
                                            {selectedUser && selectedUser.id === user.id && (
                                                <div className={styles.selectedCheck}>
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : searchUsername && !searching ? (
                                <div className={styles.noResults}>
                                    No users found matching "{searchUsername}"
                                </div>
                            ) : null}
                        </div>                        <div className={styles.newChatActions}>
                            <button
                                className={styles.createChatBtn}
                                disabled={!selectedUser || searching}
                                onClick={handleCreateChat}
                            >
                                {searching ? (
                                    <>
                                        <span className={styles.loadingSpinner}></span>
                                        Creating conversation...
                                    </>
                                ) : (
                                    'Start Conversation'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesPage;


