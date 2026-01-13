import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../assets/css/ExplorePage.module.css';
import Sidebar from '../components/Sidebar';
import PostService from '../services/post.service.jsx';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment } from '@fortawesome/free-solid-svg-icons';

const ExplorePage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();
    const location = useLocation();


    const [explorePosts, setExplorePosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const data = await PostService.getExplorePosts(0);
                setExplorePosts(data.posts || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching explore posts:", err);
                setError("Failed to load posts. Please try again later.");
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <p>Loading explore posts...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className={styles.exploreGrid}>
                        {explorePosts.length > 0 ? (
                            explorePosts.map(post => (
                                <div
                                    key={post.id}
                                    className={styles.exploreItem}
                                    onClick={() => navigate(`/post/${post.id}`, {
                                        state: { background: location }
                                    })}
                                >
                                    <img
                                        src={post.firstMediaName || 'https://via.placeholder.com/300'}
                                        alt={`Explore post ${post.id}`}
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
                            <p className={styles.noPostsMessage}>No posts found in this category</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplorePage;
