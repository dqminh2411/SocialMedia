import React from 'react';
import styles from '../assets/css/NotificationsPage.module.css';
import Sidebar from '../components/Sidebar';

const NotificationsPage = () => {
    // Mock data for notifications
    const notifications = [
        {
            id: 1,
            type: 'like',
            username: 'hoangminhtrong04',
            avatar: '../assets/images/anh1.png',
            content: 'liked your photo',
            time: '2h',
            postImage: '../assets/images/pexels-m-venter-792254-1659438.jpg'
        },
        {
            id: 2,
            type: 'follow',
            username: 'qingzhong04',
            avatar: '../assets/images/anh2.png',
            content: 'started following you',
            time: '1d'
        },
        {
            id: 3,
            type: 'comment',
            username: 'qingzhong05',
            avatar: '../assets/images/anh3.png',
            content: 'commented: "Great shot!"',
            time: '3d',
            postImage: '../assets/images/pexels-m-venter-792254-1659438.jpg'
        },
        {
            id: 4,
            type: 'mention',
            username: 'qingzhong06',
            avatar: '../assets/images/anh4.png',
            content: 'mentioned you in a comment',
            time: '5d'
        }
    ];

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.notificationsContainer}>
                    <h2 className={styles.title}>Notifications</h2>

                    <div className={styles.notificationTabs}>
                        <button className={`${styles.tabButton} ${styles.active}`}>All</button>
                        <button className={styles.tabButton}>Likes</button>
                        <button className={styles.tabButton}>Comments</button>
                        <button className={styles.tabButton}>Follows</button>
                        <button className={styles.tabButton}>Mentions</button>
                    </div>

                    <div className={styles.notificationsList}>
                        {notifications.map(notification => (
                            <div key={notification.id} className={styles.notificationItem}>
                                <div className={styles.avatar}>
                                    <img src={notification.avatar} alt={notification.username} />
                                </div>
                                <div className={styles.notificationContent}>
                                    <p>
                                        <span className={styles.username}>{notification.username}</span>
                                        {' '}
                                        {notification.content}
                                        {' '}
                                        <span className={styles.time}>{notification.time}</span>
                                    </p>
                                </div>
                                {notification.postImage && (
                                    <div className={styles.postThumbnail}>
                                        <img src={notification.postImage} alt="Post thumbnail" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
