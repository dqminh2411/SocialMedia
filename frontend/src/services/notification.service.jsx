import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/';

class NotificationService {
    // Get all notifications for current user
    getNotifications(page = 0, size = 10) {
        return axios.get(
            API_URL + 'notifications',
            {
                params: { page, size },
                headers: authHeader()
            }
        ).then(response => {
            return response.data.data;
        });
    }

    // Send a follow request notification
    sendFollowRequest(recipientId, senderId) {
        return axios.post(
            API_URL + 'notifications/follow-request',
            {
                recipientId: recipientId,
                senderId: senderId
            },
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }

    // Accept a follow request
    acceptFollowRequest(notificationId) {
        return axios.post(
            API_URL + 'notifications/accept',
            { id: notificationId },
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }

    // Reject a follow request
    rejectFollowRequest(notificationId) {
        return axios.post(
            API_URL + 'notifications/' + notificationId + '/reject',
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }

    // Mark notification as read
    markAsRead(notificationId) {
        return axios.put(
            API_URL + 'notifications/' + notificationId + '/read',
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }

    // Mark all notifications as read
    markAllAsRead() {
        return axios.put(
            API_URL + 'notifications/read-all',
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }

    // Get all sent follow requests
    getSentFollowRequests() {
        return axios.get(API_URL + 'notifications/sent-requests', { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }
}

export default new NotificationService();