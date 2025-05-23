import React from 'react';
import styles from '../assets/css/ProfilePage.module.css';
import Sidebar from '../components/Sidebar';

const ProfilePage = () => {
    // In a real app, fetch user data from an API or context
    const user = {
        username: 'TrungOK',
        fullName: 'Trung Nguyen',
        bio: 'Software Developer | Photography Enthusiast',
        postsCount: 42,
        followersCount: 1024,
        followingCount: 500,
        profilePic: '../assets/images/daidien.png'
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.profileHeader}>
                    <div className={styles.profilePicture}>
                        <img src={user.profilePic} alt={user.username} />
                    </div>
                    <div className={styles.profileInfo}>
                        <h1>{user.username}</h1>
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>{user.postsCount}</span> posts
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>{user.followersCount}</span> followers
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>{user.followingCount}</span> following
                            </div>
                        </div>
                        <div className={styles.bio}>
                            <p className={styles.fullName}>{user.fullName}</p>
                            <p>{user.bio}</p>
                        </div>
                        <button className={styles.editProfileBtn}>Edit Profile</button>
                    </div>
                </div>

                <div className={styles.profileTabs}>
                    <button className={`${styles.tabButton} ${styles.active}`}>Posts</button>
                    <button className={styles.tabButton}>Saved</button>
                    <button className={styles.tabButton}>Tagged</button>
                </div>

                <div className={styles.postsGrid}>
                    <p>User posts will appear here</p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
