import React, { useState } from 'react';
import styles from '../assets/css/FriendSuggestion.module.css';
import NotificationService from '../services/notification.service';
import AuthService from '../services/auth.service';
import { Link } from 'react-router-dom';

const FriendSuggestion = ({ id, username, avatar, onFollowRequestSent }) => {
    const [followStatus, setFollowStatus] = useState('notFollowing');
    const [isLoading, setIsLoading] = useState(false);
    const currentUser = AuthService.getCurrentUser();
    const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
    const DEFAULT_AVATAR = 'defaultAvatar.jpg';
    const handleFollowClick = async () => {
        if (isLoading || !currentUser) return;

        setIsLoading(true);

        try {
            await NotificationService.sendFollowRequest(id, currentUser.user.id);
            setFollowStatus('requested');

            // Notify parent component that a follow request was sent
            if (onFollowRequestSent) {
                onFollowRequestSent(id);
            }
        } catch (error) {
            console.error("Error sending follow request:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <li className={styles.suggestionItem}>
            <div className={styles.userInfo}>
                <img src={avatar || null} alt={username} className={styles.avatar} />
                <Link to={`/profile/un/${username}`} className={styles.userLink}>
                    <div className={styles.userDetails}>
                        <span className={styles.username}>{username}</span>
                    </div>
                </Link>
            </div>

            {followStatus === 'notFollowing' && (
                <button
                    className={`${styles.followButton} ${isLoading ? styles.loading : ''}`}
                    onClick={handleFollowClick}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className={styles.loadingDots}>
                            <span>.</span><span>.</span><span>.</span>
                        </span>
                    ) : (
                        'Follow'
                    )}
                </button>
            )}

            {followStatus === 'requested' && (
                <button className={`${styles.followButton} ${styles.requested}`} disabled>
                    <span className={styles.requestedText}>Requested</span>
                </button>
            )}

            {followStatus === 'following' && (
                <button className={`${styles.followButton} ${styles.following}`} disabled>
                    <span className={styles.followingText}>Following</span>
                </button>
            )}
        </li>
    );
};

export default FriendSuggestion;
