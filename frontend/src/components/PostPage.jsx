import React from 'react';
import PostForm from './PostForm';

const PostPage = () => {

    const existingPost = {
        content: 'Check out this amazing sunset! <span class="hashtag">#photography</span> <span class="hashtag">#nature</span> <span class="mention">@johndoe</span> <a href="https://example.com" class="url" target="_blank">My travel blog</a>',
        images: [
            { id: 1, url: 'https://via.placeholder.com/500/300' }
        ],
        videos: []
    };

    const handleSubmit = (formData) => {
        console.log('Form submitted with:', formData);


    };

    return (
        <div>
            <h1>Create New Post</h1>
            <PostForm onSubmit={handleSubmit} />

        </div>
    );
};

export default PostPage;
