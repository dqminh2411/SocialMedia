import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/';

class NotificationService {

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


    acceptFollowRequest(notificationId) {
        return axios.post(
            API_URL + 'notifications/accept',
            { id: notificationId },
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }


    rejectFollowRequest(notificationId) {
        return axios.post(
            API_URL + 'notifications/' + notificationId + '/reject',
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }


    markAsRead(notificationId) {
        return axios.put(
            API_URL + 'notifications/' + notificationId + '/read',
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }


    markAllAsRead() {
        return axios.put(
            API_URL + 'notifications/read-all',
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        });
    }


    getSentFollowRequests() {
        return axios.get(API_URL + 'notifications/sent-requests', { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }
}

export default new NotificationService();
