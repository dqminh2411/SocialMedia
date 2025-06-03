import React, { createContext, useState, useEffect, useContext } from 'react';
import MessageService from '../services/message.service';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';
import ProfileService from '../services/profile.service';
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const currentUser = AuthService.getCurrentUser();

    const formatRelativeTime = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Just now";

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    };
    // Connect to WebSocket and fetch chats when user logs in
    useEffect(() => {
        if (!currentUser) return;

        let reconnectInterval = null;

        // Fetch user's chats
        const fetchChats = async () => {
            try {
                setLoading(true);
                setError(null);

                const userId = currentUser.user.id;
                const chatsData = await MessageService.getAllChats(userId);

                if (chatsData && Array.isArray(chatsData)) {
                    // Format conversations data for display
                    const formattedChats = chatsData.map(chat => ({
                        id: chat.id,
                        userId: chat.otherUser.id,
                        username: chat.otherUser.username,
                        avatar: UserService.getAvatarUrl(chat.otherUser.avatar),
                        lastMessage: chat.lastMessage?.content || "No messages yet",
                        time: chat.lastMessage ? formatRelativeTime(new Date(chat.lastMessage.sentAt)) : "",
                        unread: chat.lastMessage ? chat.lastMessage.read === false && chat.lastMessage.senderId !== userId : true
                    }));

                    setChats(formattedChats);
                    setUnreadCount(formattedChats.filter(chat => chat.unread).length);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching chats:", err);
                setError("Failed to load conversations");
                setLoading(false);
            }
        };

        // Connect to WebSocket
        const connectWebSocket = async () => {
            try {
                console.log("Connecting to WebSocket Chat...");
                await MessageService.connect();
                setIsConnected(true);
                console.log("WebSocket Chat connected successfully");
            } catch (error) {
                console.error("Error connecting to WebSocket Chat:", error);
                setIsConnected(false);
                // Try to reconnect after 5 seconds
                setTimeout(connectWebSocket, 5000);
            }
        };

        // Periodically check connection status
        const checkConnection = () => {
            if (!isConnected) {
                console.log("Checking WebSocket connection status");
                MessageService.checkConnection()
                    .then(connected => {
                        setIsConnected(connected);
                    })
                    .catch(() => {
                        setIsConnected(false);
                    });
            }
        };

        fetchChats();
        connectWebSocket();

        // Set up connection checker every 30 seconds
        reconnectInterval = setInterval(checkConnection, 30000);

        // Register message handler
        const unsubscribe = MessageService.onMessage(handleNewMessage);

        // Cleanup function
        return () => {
            console.log("Cleaning up chat context");
            unsubscribe();
            MessageService.disconnect();

            if (reconnectInterval) {
                clearInterval(reconnectInterval);
            }
        };
    }, []);

    // Handle incoming WebSocket messages
    const handleNewMessage = (newMessage) => {
        if (!newMessage || !newMessage.chatId) return;

        const chatId = newMessage.chatId;

        // Update messages if this chat is loaded
        setMessages(prevMessages => {
            if (!prevMessages[chatId]) return prevMessages;

            return {
                ...prevMessages,
                [chatId]: [...(prevMessages[chatId] || []), newMessage]
            };
        });

        // Update chat list
        setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
                if (chat.id === chatId) {
                    const isUnread = newMessage.senderId !== currentUser.user.id &&
                        activeChat !== chatId;

                    // If it's becoming unread and wasn't before, increment unread count
                    if (isUnread && !chat.unread) {
                        setUnreadCount(prev => prev + 1);
                    }

                    return {
                        ...chat,
                        lastMessage: newMessage.content,
                        time: "Just now",
                        unread: isUnread
                    };
                }
                return chat;
            });

            // Move the updated chat to the top
            const chatIndex = updatedChats.findIndex(c => c.id === chatId);
            if (chatIndex > 0) {
                const [chat] = updatedChats.splice(chatIndex, 1);
                updatedChats.unshift(chat);
            }

            return updatedChats;
        });

        // If the chat is active, mark message as read
        if (activeChat === chatId && newMessage.senderId !== currentUser.user.id) {
            markMessageAsRead(chatId, newMessage.id);
        }
    };

    // Get messages for a specific chat
    const getMessages = async (chatId) => {
        try {
            setLoading(true);

            // Only fetch if not already loaded
            if (!messages[chatId] || messages[chatId].length === 0) {
                const messagesData = await MessageService.getAllMessages(chatId);

                if (messagesData && Array.isArray(messagesData)) {
                    setMessages(prevMessages => ({
                        ...prevMessages,
                        [chatId]: messagesData
                    }));
                }
            }

            setActiveChat(chatId);

            // Mark chat as read in the UI
            setChats(prevChats =>
                prevChats.map(chat => {
                    if (chat.id === chatId && chat.unread) {
                        setUnreadCount(prev => Math.max(0, prev - 1));
                        return { ...chat, unread: false };
                    }
                    return chat;
                })
            );

            setLoading(false);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setError("Failed to load messages");
            setLoading(false);
        }
    };    // Send a message
    const sendMessage = (chatId, content) => {
        if (!currentUser) return;

        const senderId = currentUser.user.id;

        // Optimistically update UI
        const tempMessage = {
            id: Date.now(), // Temporary ID
            senderId: senderId,
            chatId: chatId,
            content: content,
            sentAt: new Date(),
            read: false,
            pending: false // Flag to indicate message is being sent
        };

        // Add message to UI
        setMessages(prevMessages => ({
            ...prevMessages,
            [chatId]: [...(prevMessages[chatId] || []), tempMessage]
        }));

        // Update the last message in chat list
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.id === chatId
                    ? { ...chat, lastMessage: content, time: 'Just now' }
                    : chat
            )
        );

        // Check if WebSocket is connected first
        if (!isConnected) {
            console.log("WebSocket not connected, attempting to connect...");
            MessageService.connect()
                .then(() => {
                    console.log("Connected to WebSocket, sending message");
                    setIsConnected(true);
                    MessageService.sendMessage(senderId, chatId, content);
                })
                .catch(error => {
                    console.error("Failed to connect WebSocket for sending message:", error);
                    // Mark message as failed in UI
                    setMessages(prevMessages => ({
                        ...prevMessages,
                        [chatId]: prevMessages[chatId].map(msg =>
                            msg.id === tempMessage.id
                                ? { ...msg, pending: false, failed: true }
                                : msg
                        )
                    }));
                });
        } else {
            // Send message via WebSocket
            MessageService.sendMessage(senderId, chatId, content);
        }
    };
    const createChat = async (otherUserId) => {
        if (!currentUser) return null;

        try {
            console.log("Creating chat with user ID:", otherUserId);

            // Check if a chat already exists with this user
            const existingChat = chats.find(chat => chat.userId === otherUserId);

            if (existingChat) {
                console.log("Chat already exists, using existing chat:", existingChat.id);
                // If chat exists, just set it as active and return its id
                setActiveChat(existingChat.id);

                // Make sure we have messages for this chat
                if (!messages[existingChat.id] || messages[existingChat.id].length === 0) {
                    getMessages(existingChat.id);
                }

                return existingChat.id;
            }

            // Create a new chat
            const newChatData = {
                thisUserId: currentUser.user.id,
                otherUserId: otherUserId
            };

            console.log("Creating new chat with data:", newChatData);
            const createdChat = await MessageService.createChat(newChatData);
            console.log("Chat created:", createdChat);

            if (createdChat) {
                // Get user info
                const userResponse = await ProfileService.getUserProfile(otherUserId);
                const otherUser = userResponse;
                console.log("Got other user data:", otherUser);

                // Format the new chat for display
                const formattedChat = {
                    id: createdChat.id,
                    userId: otherUserId,
                    username: otherUser.username,
                    avatar: UserService.getAvatarUrl(otherUser.avatar),
                    lastMessage: "No messages yet",
                    time: "",
                    unread: false
                };

                console.log("Adding new chat to list:", formattedChat);
                // Add new chat to the list
                setChats(prevChats => [formattedChat, ...prevChats]);

                // Initialize empty message list for this chat
                setMessages(prevMessages => ({
                    ...prevMessages,
                    [createdChat.id]: []
                }));

                console.log("Setting active chat to:", createdChat.id);
                // Set as active chat
                setActiveChat(createdChat.id);

                return createdChat.id;
            }

        } catch (error) {
            console.error("Error creating chat:", error);
            setError("Failed to create conversation");
            return null;
        }
    };

    // Mark a message as read
    const markMessageAsRead = async (chatId, messageId) => {
        try {
            await MessageService.markAsRead(chatId, messageId);

            // Update the message in state
            setMessages(prevMessages => {
                if (!prevMessages[chatId]) return prevMessages;

                return {
                    ...prevMessages,
                    [chatId]: prevMessages[chatId].map(msg =>
                        msg.id === messageId ? { ...msg, read: true } : msg
                    )
                };
            });
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    return (
        <ChatContext.Provider value={{
            chats,
            activeChat,
            messages,
            loading,
            error,
            isConnected,
            unreadCount,
            setActiveChat,
            getMessages,
            sendMessage,
            createChat,
            markMessageAsRead
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
