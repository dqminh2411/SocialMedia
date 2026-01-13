import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../assets/css/CreatePostPage.module.css';
import Sidebar from '../components/Sidebar';
import PostForm from '../components/PostForm.jsx';
import PostService from '../services/post.service.jsx';

const CreatePostPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    
    const queryParams = new URLSearchParams(location.search);
    const editPostId = queryParams.get('edit');

    
    useEffect(() => {
        if (editPostId) {
            setLoading(true);
            PostService.getPostDetails(editPostId)
                .then(data => {
                    setPost(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching post for editing:", err);
                    setError("Failed to load post for editing. Please try again.");
                    setLoading(false);
                });
        }
    }, [editPostId]);

    const handlePostSubmit = (postData) => {
        setIsSubmitting(true);
        setError(null);
        
        navigate('/profile', { replace: true });
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.createPostContainer}>
                    <h2 className={styles.title}>
                        {editPostId ? 'Edit Post' : 'Create New Post'}
                    </h2>
                    {error && <div className={styles.error}>{error}</div>}
                    {loading ? (
                        <div className={styles.loading}>Loading post data...</div>
                    ) : (
                        <PostForm post={post} onSubmit={handlePostSubmit} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
