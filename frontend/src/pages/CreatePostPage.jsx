import React from 'react';
import styles from '../assets/css/CreatePostPage.module.css';
import Sidebar from '../components/Sidebar';
import PostForm from '../components/PostForm.jsx';

const CreatePostPage = () => {
    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.createPostContainer}>
                    <h2 className={styles.title}>Create New Post</h2>
                    <PostForm />
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
