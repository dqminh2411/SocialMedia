import React from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../assets/css/NotificationsPage.module.css';
import Sidebar from '../components/Sidebar';
import NotificationService from '../services/notification.service.jsx';
import AuthService from '../services/auth.service.jsx';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../context/NotificationContext.jsx';
const NotificationsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();
    const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
    const DEFAULT_AVATAR = 'default.png';
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        acceptFollowRequest,
        rejectFollowRequest
    } = useNotifications();

    const [readingNotification, setReadingNotification] = useState(null);

    const handleNotificationClick = async (notification) => {
            // Mark as read
            if (!notification.read) {
                await markAsRead(notification.id);
            }
            console.log("Notification clicked: ", notification);
        
            // Navigate based on notification type
            if (notification.referenceType === "COMMENT") {
                navigate(`/post/${notification.refId2}`,{
                    state: { background: location }
                });
                setTimeout(() => {
                    const commentElement = document.getElementById(`comment-${notification.refId1}`);
                    if (commentElement) {
                        commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        commentElement.classList.add(styles.highlightComment);
                        setTimeout(() => {
                            commentElement.classList.remove(styles.highlightComment);
                        }, 2000);
                    }
                }, 300);
                
            } else if (notification.referenceType === "POST") {
                navigate(`/post/${notification.refId1}`);
            }
            
        };
    
        const handleAcceptFollow = async (notification, e) => {
            e.stopPropagation();
            await acceptFollowRequest(notification.id);
        };
    
        const handleRejectFollow = async (notification, e) => {
            e.stopPropagation();
            await rejectFollowRequest(notification.id);
        };
    

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.notificationsContainer}>
                    <div className={styles.headerRow}>
                        <h2 className={styles.title}>Notifications</h2>
                        {unreadCount > 0 && (
                            <button
                                className={styles.markAllReadBtn}
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className={styles.notificationTabs}>
                        <button className={`${styles.tabButton} ${styles.active}`}>All</button>
                        <button className={styles.tabButton}>Likes</button>
                        <button className={styles.tabButton}>Comments</button>
                        <button className={styles.tabButton}>Follows</button>
                        <button className={styles.tabButton}>Mentions</button>
                    </div>

                    <div className={styles.notificationsList}>
                        {notifications.length === 0 ? (
                            <p className={styles.noNotifications}>No notifications yet</p>
                        ) : (notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`${styles.notificationItem} 
                                              ${!notification.read ? styles.unread : ''} 
                                              ${readingNotification === notification.id ? styles.reading : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={styles.notificationContent}>
                                    <img
                                        src={notification.sender?.avatar
                                            ? AVATAR_URL + notification.sender.avatar
                                            : AVATAR_URL + DEFAULT_AVATAR}
                                        alt={notification.sender?.username || "User"}
                                        className={styles.avatar}
                                    />

                                    <div className={styles.notificationDetails}>
                                        <p className={styles.notificationText}>{notification.content}</p>
                                        <span className={styles.time}>
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>

                                {notification.type === 'FOLLOW_REQUEST' && !notification.accepted && !notification.rejected && (
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={styles.acceptBtn}
                                            onClick={(e) => handleAcceptFollow(notification, e)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className={styles.rejectBtn}
                                            onClick={(e) => handleRejectFollow(notification, e)}
                                        >
                                            Reject
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
            </div>
        </div>
    );
};

export default NotificationsPage;
