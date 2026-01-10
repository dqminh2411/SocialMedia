import api from './api.js';
import authHeader from './auth-header';
import { Client } from '@stomp/stompjs';

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
        this.reconnectDelay = 5000;
    }
    connect() {
        // If already connected and active, return
        if (this.connected && this.stompClient && this.stompClient.active) {
            console.log('WebSocket already connected and active');
            return Promise.resolve();
        }

        // If a connection is in progress, return the existing promise
        if (this.connectionPromise) {
            console.log('Connection already in progress, reusing promise');
            return this.connectionPromise;
        }

        console.log('Initiating new WebSocket connection...');

        // Create new connection promise
        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                const headers = authHeader();
                
                // Create a new STOMP client using the Client class
                this.stompClient = new Client({
                    brokerURL: 'ws://localhost:8080/ws',
                    connectHeaders: headers,
                    debug: function (str) {
                        console.log('STOMP Debug:', str);
                    },
                    reconnectDelay: this.reconnectDelay,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    
                    // Connection successful callback
                    onConnect: (frame) => {
                        console.log('Connected to WebSocket: ', frame);
                        this.connected = true;


                        try {
                            console.log('Subscribing to topic:', USER_CHAT);

                            this.subscription = this.stompClient.subscribe(
                                USER_CHAT,
                                message => {
                                    console.log("🔔 WebSocket message received:", message);
                                    try {
                                        const data = JSON.parse(message.body);
                                        console.log("📨 Parsed message data:", data);

                                        // Notify all registered handlers
                                        this.messageHandlers.forEach(handler => handler(data));
                                    } catch (error) {
                                        console.error("Error parsing message:", error);
                                    }
                                },
                                { id: 'chat-subscription-' + new Date().getTime() }
                            );

                            console.log('Successfully subscribed to:', USER_CHAT);
                            this.connectionPromise = null;
                            resolve();
                        } catch (subError) {
                            console.error('Error during subscription:', subError);
                            this.connectionPromise = null;
                            resolve();
                        }
                    },
                    
                    // Connection error callback
                    onStompError: (frame) => {
                        console.error('STOMP error:', frame);
                        this.connected = false;
                    },
                    
                    // WebSocket error callback
                    onWebSocketError: (error) => {
                        console.error('WebSocket error:', error);
                        this.connected = false;
                        this.connectionPromise = null;
                        
                        // Only reject if we haven't exceeded max attempts
                        if (this.reconnectAttempts < this.maxReconnectAttempts) {
                            this.reconnectAttempts++;
                            console.log(`Will retry connection (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                        } else {
                            reject(error);
                        }
                    },
                    
                    // Connection close callback
                    onWebSocketClose: (event) => {
                        console.log('WebSocket closed:', event);
                        this.connected = false;
                        this.connectionPromise = null;
                    }
                });

                // Activate the client to start the connection
                this.stompClient.activate();
                
            } catch (error) {
                console.error('Error setting up WebSocket connection:', error);
                this.connectionPromise = null;
                reject(error);
            }
        });

        return this.connectionPromise;
    }
    disconnect() {
        try { 
            console.log('Disconnecting from WebSocket');

            // Clear handlers
            this.messageHandlers = [];

            // Clear connection promise
            this.connectionPromise = null;

            // Unsubscribe from subscription
            if (this.subscription) {
                console.log('Unsubscribing from subscription');
                try {
                    this.subscription.unsubscribe();
                } catch (subError) {
                    console.warn('Error unsubscribing:', subError);
                }
                this.subscription = null;
            }

            // Deactivate the STOMP client
            if (this.stompClient) {
                if (this.stompClient.active) {
                    console.log('Deactivating STOMP client');
                    try {
                        this.stompClient.deactivate();
                        console.log('STOMP client deactivated successfully');
                    } catch (disconnectError) {
                        console.warn('Error during STOMP deactivation:', disconnectError);
                    }
                }

                this.stompClient = null;
                this.connected = false;
            }

            console.log('WebSocket cleanup completed');
        } catch (error) {
            console.error('Error during WebSocket disconnect:', error);
            // Force cleanup
            this.stompClient = null;
            this.connected = false;
            this.subscription = null;
        }
    }
    onMessage(handler) {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }
    sendMessage(senderId, chatId, content) {

        if (!this.connected || !this.stompClient) {
            console.log('WebSocket not connected, attempting to connect before sending message');
            return this.connect()
                .then(() => this.doSendMessage(senderId, chatId, content))
                .catch(error => {
                    console.error('Failed to connect for sending message:', error);
                    return false;
                });
        }


        return Promise.resolve(this.doSendMessage(senderId, chatId, content));
    }
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
            this.stompClient.publish({
                destination: CHAT_DESTINATION,
                headers: authHeader(),
                body: JSON.stringify(message)
            });
            console.log('Message sent successfully');
            this.reconnectAttempts = 0;
            return true;
        } catch (error) {
            console.error('Error sending message:', error);


            this.connected = false;

            return false;
        }
    }

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


    checkConnection() {
        if (this.connected && this.stompClient && this.stompClient.active) {
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
