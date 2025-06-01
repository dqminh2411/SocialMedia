import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../assets/css/Sidebar.module.css';

// Import images
import homeIcon from '../assets/images/home.png';
import searchIcon from '../assets/images/Search.png';
import exploreIcon from '../assets/images/explore.png';
import messagesIcon from '../assets/images/messanges.png';
import notificationsIcon from '../assets/images/notifications.png';
import createIcon from '../assets/images/create.png';
import profileIcon from '../assets/images/profile.png';
import logoutIcon from '../assets/images/logout-icon.png';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useAuth();
    const { unreadCount } = useNotifications(); // Get unread count from NotificationContext

    const handleLogout = () => {
        console.log('Logging out user:', currentUser?.email);
        logout();
        navigate('/login');
    };

    // Function to check if a path is active
    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') {
            return true;
        }
        return path !== '/' && location.pathname.startsWith(path);
    };

    return (
        <div className={styles.sidebar}>
            <Link to="/">
                <h2 className={styles.title}>Outstagram</h2>
            </Link>            <ul>
                <li>
                    <Link to="/" className={isActive('/') ? styles.active : ''}>
                        <img src={homeIcon} alt="Home" className={styles.icon} />
                        <span>Home</span>
                    </Link>
                </li>
                <li>
                    <Link to="/search" className={isActive('/search') ? styles.active : ''}>
                        <img src={searchIcon} alt="Search" className={styles.icon} />
                        <span>Search</span>
                    </Link>
                </li>
                <li>
                    <Link to="/explore" className={isActive('/explore') ? styles.active : ''}>
                        <img src={exploreIcon} alt="Explore" className={styles.icon} />
                        <span>Explore</span>
                    </Link>
                </li>
                <li>
                    <Link to="/messages" className={isActive('/messages') ? styles.active : ''}>
                        <img src={messagesIcon} alt="Messages" className={styles.icon} />
                        <span>Messages</span>
                    </Link>
                </li>
                <li className={styles.notificationItem}>
                    <Link to="/notifications" className={isActive('/notifications') ? styles.active : ''}>
                        <div className={styles.iconContainer}>
                            <img src={notificationsIcon} alt="Notifications" className={styles.icon} />
                            {unreadCount > 0 && (
                                <span className={styles.notificationBadge}>{unreadCount}</span>
                            )}
                        </div>
                        <span>Notifications</span>
                    </Link>
                </li>
                <li>
                    <Link to="/create" className={isActive('/create') ? styles.active : ''}>
                        <img src={createIcon} alt="Create" className={styles.icon} />
                        <span>Create</span>
                    </Link>
                </li>
                <li>
                    <Link to="/profile" className={isActive('/profile') ? styles.active : ''}>
                        <img src={profileIcon} alt="Profile" className={styles.icon} />
                        <span>Profile</span>
                    </Link>
                </li>

                {currentUser && (
                    <li>
                        <div className={styles.logoutSection}>
                            <img src={logoutIcon} alt="Logout" className={styles.icon} />
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                Logout
                            </button>
                        </div>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Sidebar;
