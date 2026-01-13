import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from '../assets/css/ExplorePage.module.css';
import Sidebar from '../components/Sidebar';
import PostService from '../services/post.service.jsx';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faHashtag } from '@fortawesome/free-solid-svg-icons';

const HashtagPage = () => {
    const { hashtagName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();


    const [hashtagPosts, setHashtagPosts] = useState([]);
    const [postCount, setPostCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchHashtagPosts = async () => {
            try {
                setLoading(true);

                const data = await PostService.getPostsByHashtag(hashtagName, 0);
                setHashtagPosts(data.posts || []);
                setPostCount(data.totalElements || 0);
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching posts for hashtag #${hashtagName}:`, err);
                setError("Failed to load posts. Please try again later.");
                setLoading(false);
            }
        };

        if (hashtagName) {
            fetchHashtagPosts();
        }
    }, [hashtagName]);

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.hashtagHeader}>
                    <div className={styles.hashtagIcon}>
                        <FontAwesomeIcon icon={faHashtag} size="2x" />
                    </div>
                    <div className={styles.hashtagInfo}>
                        <h1 className={styles.hashtagName}>#{hashtagName}</h1>
                        <p className={styles.hashtagStats}>{postCount} posts</p>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <p>Loading posts for #{hashtagName}...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className={styles.exploreGrid}>
                        {hashtagPosts.length > 0 ? (
                            hashtagPosts.map(post => (
                                <div
                                    key={post.id}
                                    className={styles.exploreItem} onClick={() => navigate(`/post/${post.id}`, {
                                        state: { background: location, returnPath: `/hashtag/${hashtagName}` }
                                    })}
                                >
                                    <img
                                        src={post.firstMediaName || 'https://via.placeholder.com/300'}
                                        alt={`Post with hashtag #${hashtagName}`}
                                    />
                                    <div className={styles.overlay}>
                                        <div className={styles.stats}>
                                            <div className={styles.stat}>
                                                <FontAwesomeIcon icon={faHeart} />
                                                {post.likes}
                                            </div>
                                            <div className={styles.stat}>
                                                <FontAwesomeIcon icon={faComment} />
                                                {post.comments || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noPostsMessage}>
                                <p>No posts found with hashtag #{hashtagName}</p>
                                <p>Be the first to post with this hashtag!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HashtagPage;
