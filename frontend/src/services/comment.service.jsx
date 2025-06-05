import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/';

class CommentService {

    getComments(postId, pageNo) {
        return axios.get(
            API_URL + 'comments?postId=' + postId + '&pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }


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


    deleteComment(commentId) {
        return axios.delete(
            API_URL + 'comments/' + commentId,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }


    getReplies(commentId, pageNo) {
        return axios.get(
            API_URL + 'comments/' + commentId + '/replies?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }


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
