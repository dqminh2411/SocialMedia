import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/css/CreatePostPage.module.css';
import Sidebar from '../components/Sidebar';
import PostForm from '../components/PostForm.jsx';

const CreatePostPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handlePostSubmit = (postData) => {
        setIsSubmitting(true);
        setError(null);

        // The actual submission is handled in PostForm component
        // This is just for handling the response

        // Navigate to home page or post detail page on success
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.createPostContainer}>
                    <h2 className={styles.title}>Create New Post</h2>
                    {error && <div className={styles.error}>{error}</div>}
                    <PostForm onSubmit={handlePostSubmit} />
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
