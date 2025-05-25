import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../assets/css/ExplorePage.module.css';
import Sidebar from '../components/Sidebar';

// Import sample images
import image1 from '../assets/images/pexels-m-venter-792254-1659438.jpg';
import image2 from '../assets/images/anhthiennhien.png';
import image3 from '../assets/images/anhthiennhien2.png';

const ExplorePage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();
    const location = useLocation(); // Add useLocation hook

    // Mock data for explore posts
    const explorePosts = [
        {
            id: 1,
            image: image1,
            likes: 1250,
            comments: 42,
            category: 'photography'
        },
        {
            id: 2,
            image: image2,
            likes: 876,
            comments: 23,
            category: 'nature'
        },
        {
            id: 3,
            image: image3,
            likes: 2103,
            comments: 87,
            category: 'travel'
        },
        {
            id: 4,
            image: image1,
            likes: 562,
            comments: 11,
            category: 'photography'
        },
        {
            id: 5,
            image: image2,
            likes: 1423,
            comments: 56,
            category: 'nature'
        },
        {
            id: 6,
            image: image3,
            likes: 982,
            comments: 34,
            category: 'travel'
        },
        {
            id: 7,
            image: image1,
            likes: 730,
            comments: 19,
            category: 'photography'
        },
        {
            id: 8,
            image: image2,
            likes: 1118,
            comments: 45,
            category: 'nature'
        },
        {
            id: 9,
            image: image3,
            likes: 891,
            comments: 27,
            category: 'travel'
        }
    ];

    const filterPosts = () => {
        if (activeTab === 'all') {
            return explorePosts;
        }
        return explorePosts.filter(post => post.category === activeTab);
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.exploreTabs}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'all' ? styles.active : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'photography' ? styles.active : ''}`}
                        onClick={() => setActiveTab('photography')}
                    >
                        Photography
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'nature' ? styles.active : ''}`}
                        onClick={() => setActiveTab('nature')}
                    >
                        Nature
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'travel' ? styles.active : ''}`}
                        onClick={() => setActiveTab('travel')}
                    >
                        Travel
                    </button>
                </div>                <div className={styles.exploreGrid}>
                    {filterPosts().map(post => (<div
                        key={post.id}
                        className={styles.exploreItem}
                        onClick={() => navigate(`/post/${post.id}`, {
                            state: { background: location }
                        })}
                    >
                        <img src={post.image} alt={`Explore post ${post.id}`} />
                        <div className={styles.overlay}>
                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                    {post.likes}
                                </div>
                                <div className={styles.stat}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                                    </svg>
                                    {post.comments}
                                </div>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExplorePage;
