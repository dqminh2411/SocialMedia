import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import NotificationService from '../services/notification.service';
import AuthService from '../services/auth.service';
import { useWebSocket } from './WebSocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const currentUser = AuthService.getCurrentUser();
    
    // Get WebSocket context for real-time notifications
    const { onNotification } = useWebSocket();

    // Handle incoming real-time notifications
    const handleNewNotification = useCallback((notification) => {
        console.log("📬 New notification received:", notification);
        
        setNotifications(prev => {
            // Check if notification already exists to avoid duplicates
            if (prev.some(n => n.id === notification.id)) {
                return prev;
            }
            // Add new notification at the beginning
            return [notification, ...prev];
        });
        
        // Update unread count if notification is unread
        if (!notification.read) {
            setUnreadCount(prev => prev + 1);
        }
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const fetchNotifications = async () => {
            if (!currentUser) return;

            try {
                setLoading(true);
                const data = await NotificationService.getNotifications();
                
                setNotifications(data || []);
                setUnreadCount((data || []).filter(n => !n.read).length);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                // If unauthorized, clear data
                if (error.response?.status === 401) {
                    setNotifications([]);
                    setUnreadCount(0);
                }
                setLoading(false);
            }
        };

        // Initial fetch
        fetchNotifications();

        // Subscribe to real-time notifications via WebSocket
        const unsubscribe = onNotification(handleNewNotification);

        // Optional: Keep polling as fallback (less frequent since we have WebSocket)
        const notificationPollInterval = setInterval(fetchNotifications, 60000);

        return () => {
            unsubscribe();
            clearInterval(notificationPollInterval);
        };
    }, [currentUser?.user?.id, onNotification, handleNewNotification]);

    // Refresh notifications manually
    const refreshNotifications = async () => {
        if (!currentUser) return;
        
        try {
            setLoading(true);
            const data = await NotificationService.getNotifications();
            setNotifications(data || []);
            setUnreadCount((data || []).filter(n => !n.read).length);
            setLoading(false);
        } catch (error) {
            console.error("Error refreshing notifications:", error);
            setLoading(false);
        }
    };

    // Mark as read
    const markAsRead = async (notificationId) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const acceptFollowRequest = async (notificationId) => {
        try {
            await NotificationService.acceptFollowRequest(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true, accepted: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            alert("Follow request accepted");
        } catch (error) {
            console.error("Error accepting follow request:", error);
        }
    };

    const rejectFollowRequest = async (notificationId) => {
        try {
            await NotificationService.rejectFollowRequest(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true, rejected: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            alert("Follow request rejected");
        } catch (error) {
            console.error("Error rejecting follow request:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            markAsRead,
            markAllAsRead,
            acceptFollowRequest,
            rejectFollowRequest,
            refreshNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
