import React, { createContext, useState, useEffect, useContext } from 'react';
import NotificationService from '../services/notification.service';
import AuthService from '../services/auth.service';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const currentUser = AuthService.getCurrentUser();

    
    const fetchNotifications = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const data = await NotificationService.getNotifications();
            setNotifications(data || []);
            setUnreadCount(data.filter(n => !n.read).length);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser) return;

        fetchNotifications();

        
        const notificationPollInterval = setInterval(fetchNotifications, 30000);

        
        return () => {
            clearInterval(notificationPollInterval);
        };
    }, []);

    
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
            refreshNotifications: fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
