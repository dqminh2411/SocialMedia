import React from 'react';
import styles from '../assets/css/HomePage.module.css';
import Sidebar from '../components/Sidebar';
import Post from '../components/Post';
import SuggestionPanel from '../components/SuggestionPanel';

// Import sample images
import profileImage from '../assets/images/daidien.png';
import postImage from '../assets/images/pexels-m-venter-792254-1659438.jpg';

const HomePage = () => {
    // Sample post data - in a real app, this would come from an API
    const posts = [
        {
            id: 1,
            username: 'TrungOK',
            userAvatar: profileImage,
            image: postImage,
            likes: 10000,
            caption: 'Oliver good day at the beach',
            commentCount: 1024
        },
        // You can add more posts here
    ];

    return (
        <div className={styles.container}>
            <Sidebar />

            <div className={styles.mainContent}>
                <div className={styles.postList}>
                    {posts.map(post => (
                        <Post
                            key={post.id}
                            username={post.username}
                            userAvatar={post.userAvatar}
                            image={post.image}
                            likes={post.likes}
                            caption={post.caption}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.rightPanel}>
                <SuggestionPanel />
            </div>
        </div>
    );
};

export default HomePage;
