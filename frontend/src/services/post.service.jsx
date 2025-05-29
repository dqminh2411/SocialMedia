import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/';

class PostService {
    // Create new post
    createPost(postData, mediaFiles) {
        // Create a FormData object to send files and JSON data
        const formData = new FormData();

        // Create a JSON string for postText field
        const postTextData = {
            creatorId: postData.creatorId,
            content: postData.content,
            mentions: postData.mentions || [],
            hashtags: postData.hashtags || []
        };

        // Add the JSON string as 'postText'
        formData.append('postText', JSON.stringify(postTextData));

        // Add media files if any
        if (mediaFiles && mediaFiles.length > 0) {
            mediaFiles.forEach(file => {
                formData.append('media', file);
            });
        } else {
            // If no media is selected, add an empty array to avoid backend error
            formData.append('media', new Blob(), '');
        }

        return axios.post(
            API_URL + 'posts',
            formData,
            {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
            .then(response => {
                return response.data;
            });
    }

    // Update existing post
    updatePost(postId, postData, mediaFiles, mediaToDelete) {
        const formData = new FormData();

        // Create a JSON string for postText field
        const postTextData = {
            creatorId: postData.creatorId,
            content: postData.content,
            mentions: postData.mentions || [],
            hashtags: postData.hashtags || []
        };

        // Add the JSON string as 'postText'
        formData.append('postText', JSON.stringify(postTextData));

        // Add media files if any
        if (mediaFiles && mediaFiles.length > 0) {
            mediaFiles.forEach(file => {
                formData.append('media', file);
            });
        } else {
            // If no media is selected, add an empty array to avoid backend error
            formData.append('media', new Blob(), '');
        }

        // Add media to delete if any
        if (mediaToDelete && mediaToDelete.length > 0) {
            formData.append('mediaToDelete', JSON.stringify(mediaToDelete));
        }

        return axios.put(
            API_URL + 'posts/' + postId,
            formData,
            {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
            .then(response => {
                return response.data;
            });
    }

    // Get user's posts with pagination
    getUserPosts(userId, pageNo) {
        return axios.get(API_URL + 'posts?userId=' + userId + '&pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }

    // Like a post
    likePost(postId) {
        return axios.post(
            API_URL + 'posts/' + postId + '/like',
            {},
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }

    // Get users who liked a post with pagination
    getPostLikes(postId, pageNo) {
        return axios.get(
            API_URL + 'posts/' + postId + '/likes?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }

    // Get post details by postId
    getPostDetails(postId) {
        return axios.get(
            API_URL + 'posts/' + postId,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }
    getExplorePosts(pageNo) {
        return axios.get(
            API_URL + 'posts/explore?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }
}

export default new PostService();
