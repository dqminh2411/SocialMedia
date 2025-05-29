import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/';

class CommentService {
    // Get comments for a post with pagination
    getComments(postId, pageNo) {
        return axios.get(
            API_URL + 'comments?postId=' + postId + '&pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }

    // Add a new comment to a post
    addComment(postId, content) {
        return axios.post(
            API_URL + 'comments',
            {
                postId: postId,
                content: content
            },
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }

    // Update an existing comment
    updateComment(commentId, content) {
        return axios.put(
            API_URL + 'comments/' + commentId,
            { content: content },
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }

    // Delete a comment
    deleteComment(commentId) {
        return axios.delete(
            API_URL + 'comments/' + commentId,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }

    // Get replies for a comment with pagination
    getReplies(commentId, pageNo) {
        return axios.get(
            API_URL + 'comments/' + commentId + '/replies?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }

    // Add a reply to a comment
    addReply(commentId, content) {
        return axios.post(
            API_URL + 'comments/' + commentId + '/replies',
            {
                parentId: commentId,
                content: content
            },
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }

    // Like a comment
    likeComment(commentId) {
        return axios.post(
            API_URL + 'comments/' + commentId + '/like',
            {},
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }
}

export default new CommentService();
