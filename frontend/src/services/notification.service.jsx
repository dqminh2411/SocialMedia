import api from './api.js';
import authHeader from './auth-header';

class NotificationService {

    getNotifications(page = 0, size = 10) {
        return api.get(
            '/notifications',
            {
                params: { page, size },
                headers: authHeader()
            }
        ).then(response => {
            return response.data.data;
        });
    }


    sendFollowRequest(recipientId, senderId) {
        return api.post(
            '/notifications/follow-request',
            {
                recipientId: recipientId,
                senderId: senderId
            },
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }


    acceptFollowRequest(notificationId) {
        return api.post(
            '/notifications/accept',
            { id: notificationId },
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }


    rejectFollowRequest(notificationId) {
        return api.post(
            '/notifications/' + notificationId + '/reject',
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }


    markAsRead(notificationId) {
        return api.put(
            '/notifications/' + notificationId + '/read',
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }


    markAllAsRead() {
        return api.put(
            '/notifications/read-all',
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }


    getSentFollowRequests() {
        return api.get('/notifications/sent-requests', { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }
}

export default new NotificationService();
