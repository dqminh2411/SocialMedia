import api from './api.js';
import authHeader from './auth-header';

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

        return api.post(
            '/posts',
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

        return api.put(
            '/posts/' + postId,
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
        return api.get('/posts?userId=' + userId + '&pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }


    likePost(postId) {
        return api.post(
            '/posts/' + postId + '/likes',
            {},
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }


    getPostLikes(postId, pageNo) {
        return api.get(
            '/posts/' + postId + '/likes?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }


    getPostDetails(postId) {
        return api.get(
            '/posts/' + postId,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }
    getExplorePosts(pageNo) {
        return api.get(
            '/posts/explore?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }
    getHomePosts(pageNo = 0) {
        return api.get(
            '/posts/home?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            }
            )
    }
    getNewHomePosts(pageNo = 0) {
        return api.get(
            '/posts/new-home?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }

    searchHashtags(query) {
        return api.get(
            '/hashtags?query=' + encodeURIComponent(query),
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            }
            )
    }
    getPostsByHashtag(hashtag, pageNo = 0) {
        return api.get(
            '/posts/hashtag/' + encodeURIComponent(hashtag) + '?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }


    deletePost(postId) {
        return api.delete(
            '/posts/' + postId,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }
}

export default new PostService();
