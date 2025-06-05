import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/';

class PostService {

    createPost(postData, mediaFiles) {

        const formData = new FormData();


        const postTextData = {
            creatorId: postData.creatorId,
            content: postData.content,
            hashtags: postData.hashtags || []
        };


        formData.append('postText', JSON.stringify(postTextData));


        if (mediaFiles && mediaFiles.length > 0) {
            mediaFiles.forEach(file => {
                formData.append('media', file);
            });
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


    updatePost(postId, postData, mediaFiles, mediaToDelete) {
        const formData = new FormData();


        const postTextData = {
            creatorId: postData.creatorId,
            content: postData.content,
            mentions: postData.mentions || [],
            hashtags: postData.hashtags || []
        };


        formData.append('postText', JSON.stringify(postTextData));


        if (mediaFiles && mediaFiles.length > 0) {
            mediaFiles.forEach(file => {
                formData.append('media', file);
            });
        }


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


    getUserPosts(userId, pageNo) {
        return axios.get(API_URL + 'posts?userId=' + userId + '&pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }


    likePost(postId) {
        return axios.post(
            API_URL + 'posts/' + postId + '/like',
            {},
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }


    getPostLikes(postId, pageNo) {
        return axios.get(
            API_URL + 'posts/' + postId + '/likes?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }


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
    getHomePosts(pageNo = 0) {
        return axios.get(
            API_URL + 'posts/home?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            }
            )
    }
    getNewHomePosts(pageNo = 0) {
        return axios.get(
            API_URL + 'posts/new-home?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }

    searchHashtags(query) {
        return axios.get(
            API_URL + 'hashtags/search?query=' + encodeURIComponent(query),
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            }
            )
    }
    getPostsByHashtag(hashtag, pageNo = 0) {
        return axios.get(
            API_URL + 'posts/hashtag/' + encodeURIComponent(hashtag) + '?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }


    deletePost(postId) {
        return axios.delete(
            API_URL + 'posts/' + postId,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }
}

export default new PostService();
