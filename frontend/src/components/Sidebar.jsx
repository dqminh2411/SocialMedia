import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/css/Sidebar.module.css';

// Import images
import homeIcon from '../assets/images/home.png';
import searchIcon from '../assets/images/Search.png';
import exploreIcon from '../assets/images/explore.png';
import messagesIcon from '../assets/images/messanges.png';
import notificationsIcon from '../assets/images/notifications.png';
import createIcon from '../assets/images/create.png';
import profileIcon from '../assets/images/profile.png';
import moreIcon from '../assets/images/More.png';

const Sidebar = () => {
    return (
        <div className={styles.sidebar}>
            <h2 className={styles.title}>Instargram</h2>
            <ul>
                <li>
                    <Link to="/">
                        <img src={homeIcon} alt="Home" className={styles.icon} />
                        <span>Home</span>
                    </Link>
                </li>
                <li>
                    <Link to="/search">
                        <img src={searchIcon} alt="Search" className={styles.icon} />
                        <span>Search</span>
                    </Link>
                </li>
                <li>
                    <Link to="/explore">
                        <img src={exploreIcon} alt="Explore" className={styles.icon} />
                        <span>Explore</span>
                    </Link>
                </li>
                <li>
                    <Link to="/messages">
                        <img src={messagesIcon} alt="Messages" className={styles.icon} />
                        <span>Messages</span>
                    </Link>
                </li>
                <li>
                    <Link to="/notifications">
                        <img src={notificationsIcon} alt="Notifications" className={styles.icon} />
                        <span>Notifications</span>
                    </Link>
                </li>
                <li>
                    <Link to="/create">
                        <img src={createIcon} alt="Create" className={styles.icon} />
                        <span>Create</span>
                    </Link>
                </li>
                <li>
                    <Link to="/profile">
                        <img src={profileIcon} alt="Profile" className={styles.icon} />
                        <span>Profile</span>
                    </Link>
                </li>
                <li>
                    <Link to="/more">
                        <img src={moreIcon} alt="More" className={styles.icon} />
                        <span>More</span>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
