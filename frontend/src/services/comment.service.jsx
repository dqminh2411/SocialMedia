import api from './api.js';
import authHeader from './auth-header';

class CommentService {

    getComments(postId, pageNo) {
        return api.get(
            '/comments?postId=' + postId + '&pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }


    addComment(postId, content) {
        return api.post(
            '/comments',
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
        return api.put(
            '/comments/' + commentId,
            { content: content },
            { headers: authHeader() }
        )
            .then(response => {
                return response.data.data;
            });
    }


    deleteComment(commentId) {
        return api.delete(
            '/comments/' + commentId,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }


    getReplies(commentId, pageNo) {
        return api.get(
            '/comments/' + commentId + '/replies?pageNo=' + pageNo,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }


    addReply(commentId, content) {
        return api.post(
            '/comments/' + commentId + '/replies',
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
        return api.post(
            '/comments/' + commentId + '/like',
            {},
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            });
    }
}

export default new CommentService();
