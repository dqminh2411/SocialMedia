import React from 'react';
import PostForm from './PostForm';

const PostPage = () => {
    // For editing an existing post, you would provide this data
    // const existingPost = {
    //   content: 'Check out this amazing sunset! <span class="hashtag">#photography</span> <span class="hashtag">#nature</span> <span class="mention">@johndoe</span> <a href="https://example.com" class="url" target="_blank">My travel blog</a>',
    //   images: [
    //     { id: 1, url: 'https://via.placeholder.com/500/300' }
    //   ],
    //   videos: []
    // };

    const handleSubmit = (formData) => {
        console.log('Form submitted with:', formData);
        // Here you would send the data to your backend API
        // axios.post('/api/posts', formData) or similar

    };

    return (
        <div>
            <h1>Create New Post</h1>
            <PostForm onSubmit={handleSubmit} />

            {/* For editing: */}
            {/* <h1>Edit Post</h1>
      <PostForm post={existingPost} onSubmit={handleSubmit} /> */}
        </div>
    );
};

export default PostPage;