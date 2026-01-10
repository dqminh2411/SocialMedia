import React, { useEffect, useState } from 'react';
import styles from '../assets/css/Notifications.module.css';
import NotificationService from '../services/notification.service.jsx';
import AuthService from '../services/auth.service.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const currentUser = AuthService.getCurrentUser();
    const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
    const DEFAULT_AVATAR = 'default.png';

    useEffect(() => {
        if (!currentUser) return;


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


        NotificationService.connect();


        const unsubscribe = NotificationService.onMessage(notification => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prevCount => prevCount + 1);
        });

        return () => {

            unsubscribe();
            NotificationService.disconnect();
        };
    }, [currentUser.id]);

    const toggleNotifications = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (notification) => {

        if (!notification.read) {
            try {
                await NotificationService.markAsRead(notification.id);


                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                );
                setUnreadCount(prevCount => prevCount - 1);
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }
    };

    const handleAcceptFollow = async (notification) => {
        try {
            await NotificationService.acceptFollowRequest(notification.id);


            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true, accepted: true } : n)
            );
            setUnreadCount(prevCount => prevCount - 1);
        } catch (error) {
            console.error("Error accepting follow request:", error);
        }
    };

    const handleRejectFollow = async (notification) => {
        try {
            await NotificationService.rejectFollowRequest(notification.id);


            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true, rejected: true } : n)
            );
            setUnreadCount(prevCount => prevCount - 1);
        } catch (error) {
            console.error("Error rejecting follow request:", error);
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

    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.notificationIcon} onClick={toggleNotifications}>
                <FontAwesomeIcon icon={faBell} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                )}
            </div>

            {isOpen && (
                <div className={styles.notificationsDropdown}>
                    <div className={styles.notificationsHeader}>
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                className={styles.markAllReadBtn}
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className={styles.notificationsList}>
                        {notifications.length === 0 ? (
                            <p className={styles.noNotifications}>No notifications yet</p>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className={styles.notificationContent}>
                                        <img
                                            src={notification.sender.avatar
                                                ? AVATAR_URL + notification.sender.avatar
                                                : AVATAR_URL + DEFAULT_AVATAR}
                                            alt={notification.sender.username}
                                            className={styles.senderAvatar}
                                        />

                                        <div className={styles.notificationDetails}>
                                            <p className={styles.notificationText}>{notification.content}</p>
                                            <span className={styles.notificationTime}>
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    {notification.type === 'FOLLOW_REQUEST' && !notification.accepted && !notification.rejected && (
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={styles.acceptBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptFollow(notification);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                            <button
                                                className={styles.rejectBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRejectFollow(notification);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    )}

                                    {notification.accepted && (
                                        <span className={styles.accepted}>Accepted</span>
                                    )}

                                    {notification.rejected && (
                                        <span className={styles.rejected}>Rejected</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
