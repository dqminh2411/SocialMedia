import React, { useState, useEffect } from 'react';
import styles from '../assets/css/HomePage.module.css';
import Sidebar from '../components/Sidebar';
import Post from '../components/Post';
import SuggestionPanel from '../components/SuggestionPanel';
import PostService from '../services/post.service.jsx';
// Import sample images
import profileImage from '../assets/images/daidien.png';
import postImage from '../assets/images/pexels-m-venter-792254-1659438.jpg';
import { set } from 'date-fns';

const HomePage = () => {
    // Sample post data - in a real app, this would come from an API
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    let testPosts = [];
    useEffect(() => {

        const fetchPosts = async () => {
            try {
                setLoading(true);
                const postsData = await PostService.getHomePosts();
                console.log("Posts from following users:", postsData.posts);
                
                // Check the fetched data directly instead of the state variable
                if (postsData.posts && postsData.posts.length > 0) {
                    // We have posts from followed users, use them
                    setPosts(postsData.posts);
                } else {
                    // No posts from followed users, fetch explore posts instead
                    console.log("No posts from followed users, fetching explore posts");
                    const explorePosts = await PostService.getNewHomePosts(0);
                    console.log("Explore posts fetched:", explorePosts.posts);
                    setPosts(explorePosts.posts);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
                setError("Failed to load posts. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();

    }, [])



    if (loading) {
        return <div className={styles.loading}>Loading suggestions...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <Sidebar />

            <div className={styles.mainContent}>
                {posts.length === 0 ? (
                    <div className={styles.noPosts}>No posts available</div>
                ) : (<div className={styles.postList}>
                    {posts.map(post => {

                        return (
                            <Post
                                key={post.id}
                                id={post.id}
                                username={post.creator.username}
                                userAvatar={post.creator.avatar}
                                media={post.media}
                                likes={post.likes}
                                content={post.content}
                                createdAt={post.createdAt}
                                commentsCount={post.commentsCount}
                                isLiked={post.likedByCurrentUser}
                            />
                        );
                    })}
                </div>)}
            </div>

            <div className={styles.rightPanel}>
                <SuggestionPanel />
            </div>
        </div>
    );
};

export default HomePage;
