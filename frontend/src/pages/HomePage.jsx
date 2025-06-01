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
    const [posts, setPosts] = React.useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    let testPosts = [];
    useEffect(() => {

        const fetchPosts = async () => {
            try {
                setLoading(true);
                const postsData = await PostService.getHomePosts();

                testPosts = postsData.posts;
                setPosts(postsData.posts);
                console.log("this is post: ")
                console.log(posts)
                console.log("Posts fetched successfully: follow", postsData.posts);
                if (posts.length === 0) {
                    try {
                        setLoading(true);
                        const explorePosts = await PostService.getNewHomePosts(0);
                        testPosts = explorePosts;
                        setPosts(explorePosts.posts);
                        console.log(testPosts)
                        console.log("Explore posts fetched successfully:", explorePosts);
                    } catch (error) {
                        console.error("Error fetching explore posts:", error);
                        setError("Failed to load explore posts. Please try again later.");
                    } finally {
                        setLoading(false);
                    }
                }
            }
            catch (error) {
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

            <div className={styles.mainContent}>                {posts.length === 0 ? (
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
