import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/css/Notifications.module.css';
import NotificationService from '../services/notification.service.jsx';
import AuthService from '../services/auth.service.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const currentUser = AuthService.getCurrentUser();
    const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
    const DEFAULT_AVATAR = 'default.png';

    // Use NotificationContext instead of local state
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        acceptFollowRequest,
        rejectFollowRequest
    } = useNotifications();

    const toggleNotifications = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        console.log("Notification clicked: ", notification);
        // Close dropdown
        setIsOpen(false);

        // Navigate based on notification type
        if (notification.referenceType === "COMMENT") {
            navigate(`/post/${notification.refId2}`);
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
                                    className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''} ${
                                        notification.type !== 'FOLLOW_REQUEST' ? styles.clickable : ''
                                    }`}
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
                                                onClick={(e) => handleAcceptFollow(notification, e)}
                                            >
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                            <button
                                                className={styles.rejectBtn}
                                                onClick={(e) => handleRejectFollow(notification, e)}
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


