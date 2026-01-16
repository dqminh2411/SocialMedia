import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import MessageService from '../services/message.service';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';
import ProfileService from '../services/profile.service';
import { useWebSocket } from './WebSocketContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const currentUser = AuthService.getCurrentUser();
    const activeChatRef = useRef(activeChat);
    
    // Get WebSocket context
    const { isConnected, onChatMessage, sendChatMessage } = useWebSocket();

    // Keep activeChatRef in sync
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

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
    
    useEffect(() => {
        if (!currentUser) {
            setChats([]);
            setMessages({});
            setUnreadCount(0);
            setActiveChat(null);
            return;
        }
        const fetchChats = async () => {
            try {
                setLoading(true);
                setError(null);

                const userId = currentUser.user.id;
                const chatsData = await MessageService.getAllChats();

                if (chatsData && Array.isArray(chatsData)) {
                    
                    const formattedChats = chatsData.map(chat => ({
                        id: chat.id,
                        userId: chat.otherUser.id,
                        username: chat.otherUser.username,
                        avatar: chat.otherUser.avatar,
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
                // If unauthorized, stop trying
                if (err.response?.status === 401) {
                    setChats([]);
                    setUnreadCount(0);
                }
                setError("Failed to load conversations");
                setLoading(false);
            }
        };

        fetchChats();

        // Subscribe to chat messages via WebSocket
        const unsubscribe = onChatMessage(handleNewMessage);
        
        return () => {
            unsubscribe();
        };
    }, [currentUser?.user?.id, onChatMessage]);
    
    const handleNewMessage = (newMessage) => {
        if (!newMessage || !newMessage.chatId) return;

        const chatId = newMessage.chatId;

        
        setMessages(prevMessages => {
            // Check if message already exists to avoid duplicates
            if (prevMessages[chatId]?.some(msg => msg.id === newMessage.id)) {
                return prevMessages;
            }

            return {
                ...prevMessages,
                [chatId]: [...(prevMessages[chatId] || []), newMessage]
            };
        });

        
        setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
                if (chat.id === chatId) {
                    const isUnread = newMessage.senderId !== currentUser.user.id &&
                        activeChatRef.current !== chatId;

                    
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

            
            const chatIndex = updatedChats.findIndex(c => c.id === chatId);
            if (chatIndex > 0) {
                const [chat] = updatedChats.splice(chatIndex, 1);
                updatedChats.unshift(chat);
            }

            return updatedChats;
        });

        
        if (activeChatRef.current === chatId && newMessage.senderId !== currentUser.user.id) {
            markMessageAsRead(chatId, newMessage.id);
        }
    };

    
    const getMessages = async (chatId) => {
        try {
            setLoading(true);

            
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
    };    
    const sendMessage = (chatId, content) => {
        if (!currentUser) return;

        const senderId = currentUser.user.id;

        
        const tempMessage = {
            id: Date.now(), 
            senderId: senderId,
            chatId: chatId,
            content: content,
            sentAt: new Date(),
            read: false,
            pending: false 
        };

        
        setMessages(prevMessages => ({
            ...prevMessages,
            [chatId]: [...(prevMessages[chatId] || []), tempMessage]
        }));

        
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.id === chatId
                    ? { ...chat, lastMessage: content, time: 'Just now' }
                    : chat
            )
        );

        
        if (!isConnected) {
            console.log("WebSocket not connected, message may fail...");
            // Still try to send - WebSocket might reconnect
            sendChatMessage(senderId, chatId, content);
        } else {
            sendChatMessage(senderId, chatId, content);
        }
    };
    const createChat = async (otherUserId) => {
        if (!currentUser) return null;

        try {
            console.log("Creating chat with user ID:", otherUserId);

            
            const existingChat = chats.find(chat => chat.userId === otherUserId);

            if (existingChat) {
                console.log("Chat already exists, using existing chat:", existingChat.id);
                
                setActiveChat(existingChat.id);

                
                if (!messages[existingChat.id] || messages[existingChat.id].length === 0) {
                    getMessages(existingChat.id);
                }

                return existingChat.id;
            }

            
    

            console.log("Creating new chat with user:", otherUserId);
            const createdChat = await MessageService.createChat(otherUserId);
            console.log("Chat created:", createdChat);

            if (createdChat) {
                
                const userResponse = await ProfileService.getUserProfile(otherUserId);
                const otherUser = userResponse;
                console.log("Got other user data:", otherUser);

                
                const formattedChat = {
                    id: createdChat.id,
                    userId: otherUserId,
                    username: otherUser.username,
                    avatar: otherUser.avatar,
                    lastMessage: "No messages yet",
                    time: "",
                    unread: false
                };

                console.log("Adding new chat to list:", formattedChat);
                
                setChats(prevChats => [formattedChat, ...prevChats]);

                
                setMessages(prevMessages => ({
                    ...prevMessages,
                    [createdChat.id]: []
                }));

                console.log("Setting active chat to:", createdChat.id);
                
                setActiveChat(createdChat.id);

                return createdChat.id;
            }

        } catch (error) {
            console.error("Error creating chat:", error);
            setError("Failed to create conversation");
            return null;
        }
    };

    
    const markMessageAsRead = async (chatId, messageId) => {
        try {
            await MessageService.markAsRead(chatId, messageId);

            
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
