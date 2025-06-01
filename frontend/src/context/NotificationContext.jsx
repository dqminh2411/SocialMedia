import React, { createContext, useState, useEffect, useContext } from 'react';
import NotificationService from '../services/notification.service';
import AuthService from '../services/auth.service';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const currentUser = AuthService.getCurrentUser();
    useEffect(() => {
        if (!currentUser) return;

        // Fetch existing notifications
        const fetchNotifications = async () => {
            try {
                const data = await NotificationService.getNotifications();
                setNotifications(data || []);
                setUnreadCount(data.filter(n => !n.read).length);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();

        // Connect to WebSocket
        const connectWebSocket = async () => {
            try {
                console.log("Connecting to WebSocket...");
                await NotificationService.connect(currentUser.user.email);
                setIsConnected(true);
                console.log("WebSocket connected successfully");
            } catch (error) {
                console.error("Error connecting to WebSocket:", error);
                setIsConnected(false);
                // Try to reconnect after 5 seconds
                setTimeout(connectWebSocket, 5000);
            }
        };

        connectWebSocket();

        // Register notification handler
        const unsubscribe = NotificationService.onMessage(notification => {
            console.log("New notification received:", notification);
            // Add the new notification to the top of the list
            setNotifications(prev => [notification, ...prev]);
            // Increment unread count
            setUnreadCount(prev => prev + 1);

            // You could also show a toast notification here
        });

        // Cleanup function
        return () => {
            unsubscribe();
            NotificationService.disconnect();
        };
    }, []);

    // Functions to handle notifications
    const markAsRead = async (notificationId) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => prev - 1);
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
            setUnreadCount(prev => prev - 1);
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
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error("Error rejecting follow request:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            isConnected,
            markAsRead,
            markAllAsRead,
            acceptFollowRequest,
            rejectFollowRequest
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);