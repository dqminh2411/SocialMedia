import axios from 'axios';
import authHeader from './auth-header';
import { Stomp } from '@stomp/stompjs';

const CHAT_DESTINATION = '/app/chat';
const USER_CHAT = '/user/chat';

class MessageService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscription = null;
        this.messageHandlers = [];
        this.connectionPromise = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    connect() {
        // If already connected, return existing promise
        if (this.connected && this.stompClient) {
            return Promise.resolve();
        }

        // If connection is in progress, return the existing promise
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        // Create a new connection promise
        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                // Get the token from authHeader
                const headers = authHeader();
                // Create a WebSocket connection
                const socket = new WebSocket("ws://localhost:8080/ws");

                this.stompClient = Stomp.over(socket);

                // Enable debug logging for troubleshooting
                this.stompClient.debug = function (str) {
                    console.log('STOMP Debug:', str);
                };                // Connect to the STOMP broker
                this.stompClient.connect(
                    headers,
                    (frame) => {
                        console.log('Connected to WebSocket: ' + frame);
                        this.connected = true;

                        // Subscribe only after we're connected
                        try {
                            console.log('Subscribing to topic:', USER_CHAT);

                            this.subscription = this.stompClient.subscribe(
                                USER_CHAT,
                                message => {
                                    console.log("🔔 WebSocket message received:", message);
                                    try {
                                        const data = JSON.parse(message.body);
                                        console.log("📨 Parsed message data:", data);

                                        // Call all registered handlers
                                        this.messageHandlers.forEach(handler => handler(data));
                                    } catch (error) {
                                        console.error("Error parsing message:", error);
                                    }
                                },
                                { id: 'chat-subscription-' + new Date().getTime() }
                            );

                            console.log('Successfully subscribed to:', USER_CHAT);
                            this.connectionPromise = null; // Clear the promise to allow future connection attempts
                            resolve();
                        } catch (subError) {
                            console.error('Error during subscription:', subError);
                            // Still resolve as connected even if subscription fails
                            this.connectionPromise = null;
                            resolve();
                        }
                    },
                    (error) => {
                        console.error('Error connecting to WebSocket:', error);
                        this.connected = false;
                        this.stompClient = null;
                        this.connectionPromise = null;
                        reject(error);
                    }
                );
            } catch (error) {
                console.error('Error setting up WebSocket connection:', error);
                this.connectionPromise = null;
                reject(error);
            }
        });

        return this.connectionPromise;
    }    // Disconnect from WebSocket
    disconnect() {
        try {
            console.log('Disconnecting from WebSocket');

            // Clear all handlers
            this.messageHandlers = [];

            // Clear any pending connection promise
            this.connectionPromise = null;

            // Unsubscribe from any active subscriptions
            if (this.subscription) {
                console.log('Unsubscribing from subscription');
                try {
                    this.subscription.unsubscribe();
                } catch (subError) {
                    console.warn('Error unsubscribing:', subError);
                }
                this.subscription = null;
            }

            // Disconnect the STOMP client if connected
            if (this.stompClient) {
                if (this.connected) {
                    console.log('Disconnecting STOMP client');
                    try {
                        this.stompClient.disconnect(() => {
                            console.log('STOMP client disconnected successfully');
                        });
                    } catch (disconnectError) {
                        console.warn('Error during STOMP disconnect:', disconnectError);
                    }
                }

                // Clean up resources regardless of disconnect success
                this.stompClient = null;
                this.connected = false;
            }

            console.log('WebSocket cleanup completed');
        } catch (error) {
            console.error('Error during WebSocket disconnect:', error);
            // Ensure resources are cleaned up even if there's an error
            this.stompClient = null;
            this.connected = false;
            this.subscription = null;
        }
    }// Register a message handler
    onMessage(handler) {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }
    sendMessage(senderId, chatId, content) {
        // If not connected, try to connect first
        if (!this.connected || !this.stompClient) {
            console.log('WebSocket not connected, attempting to connect before sending message');
            return this.connect()
                .then(() => this.doSendMessage(senderId, chatId, content))
                .catch(error => {
                    console.error('Failed to connect for sending message:', error);
                    return false;
                });
        }

        // If already connected, send immediately
        return Promise.resolve(this.doSendMessage(senderId, chatId, content));
    }    // Internal method to actually send the message
    doSendMessage(senderId, chatId, content) {
        const message = {
            senderId,
            chatId,
            content
        };

        try {
            if (!this.stompClient) {
                throw new Error('STOMP client is not initialized');
            }

            if (!this.connected) {
                throw new Error('WebSocket is not connected');
            }

            console.log('Sending message to', CHAT_DESTINATION, message);
            this.stompClient.send(CHAT_DESTINATION, authHeader(), JSON.stringify(message));
            console.log('Message sent successfully');
            this.reconnectAttempts = 0; // Reset reconnect attempts on successful send
            return true;
        } catch (error) {
            console.error('Error sending message:', error);

            // If we encounter an error while sending, check connection on next attempt
            this.connected = false;

            return false;
        }
    }

    getAllMessages(chatId) {
        return axios.get(
            `http://localhost:8080/api/chat/${chatId}`,
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        }).catch(error => {
            console.error("Error fetching messages:", error);
            throw error;
        });
    }
    getAllChats(userId) {
        return axios.get(
            `http://localhost:8080/api/chat/user/${userId}`,
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        }).catch(error => {
            console.error("Error fetching chats:", error);
            throw error;
        });
    }
    createChat(newChat) {
        return axios.post(
            `http://localhost:8080/api/chat`,
            newChat,
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        }).catch(error => {
            console.error("Error creating chat:", error);
            throw error;
        });
    }

    markAsRead(chatId, messageId) {
        return axios.put(
            `http://localhost:8080/api/chat/${chatId}/messages/${messageId}/read`,
            {},
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        }).catch(error => {
            console.error("Error marking message as read:", error);
            throw error;
        });
    }

    // Check connection status and reconnect if needed
    checkConnection() {
        if (this.connected && this.stompClient) {
            console.log('WebSocket connection is active');
            return Promise.resolve(true);
        }

        console.log('WebSocket not connected, attempting to reconnect...');
        return this.connect()
            .then(() => {
                console.log('Reconnection successful');
                return true;
            })
            .catch(error => {
                console.error('Reconnection failed:', error);
                return false;
            });
    }
}

export default new MessageService();