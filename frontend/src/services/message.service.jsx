import api from './api.js';
import authHeader from './auth-header';

class MessageService {
    getAllMessages(chatId) {
        return api.get(
            `/chat/${chatId}`,
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        }).catch(error => {
            console.error("Error fetching messages:", error);
            throw error;
        });
    }
    getAllChats() {
        return api.get(
            `/chat`,
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        }).catch(error => {
            console.error("Error fetching chats:", error);
            throw error;    
        });
    }
    createChat(otherUserId) {
        return api.post(
            `/chat/${otherUserId}`,
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        }).catch(error => {
            console.error("Error creating chat:", error);
            throw error;
        });
    }

    markAsRead(chatId, messageId) {
        return api.put(
            `/chat/${chatId}/messages/${messageId}/read`,
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        }).catch(error => {
            console.error("Error marking message as read:", error);
            throw error;
        });
    }
}

export default new MessageService();
