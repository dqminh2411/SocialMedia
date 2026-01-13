import api from './api';
import authHeader from './auth-header';
import {Client} from '@stomp/stompjs';


const USER_CHAT = '/user/chat';
const USER_NOTI = '/user/noti';
const CHAT_DESTINATION = '/app/chat';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.chatSubscription = null;
        this.notificationSubscription = null;
        this.connected = false;
        this.connectionPromise = null;
        this.reconnectDelay = 5000;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        // Handler arrays for chat and notification messages
        this.chatHandlers = [];
        this.notificationHandlers = [];
    }
    
    // Register a chat message handler
    onChatMessage(handler) {
        this.chatHandlers.push(handler);
        return () => {
            this.chatHandlers = this.chatHandlers.filter(h => h !== handler);
        };
    }
    
    // Register a notification handler
    onNotification(handler) {
        this.notificationHandlers.push(handler);
        return () => {
            this.notificationHandlers = this.notificationHandlers.filter(h => h !== handler);
        };
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
            
                const header = authHeader();
                console.log('Auth headers for WebSocket: ', header);
                // Create a new STOMP client using the Client class
                this.stompClient = new Client({
                    brokerURL: 'ws://localhost:8080/ws',
                    connectHeaders: header,
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

                            this.chatSubscription = this.stompClient.subscribe(
                                USER_CHAT,
                                message => {
                                    console.log("🔔 Chat message received:", message);
                                    try {
                                        const data = JSON.parse(message.body);
                                        console.log("📨 Parsed chat message:", data);

                                        // Notify all registered chat handlers
                                        this.chatHandlers.forEach(handler => handler(data));
                                    } catch (error) {
                                        console.error("Error parsing chat message:", error);
                                    }
                                },
                                { id: 'chat-subscription-' + new Date().getTime() }
                            );

                            console.log('Successfully subscribed to CHAT CHANNEL:', USER_CHAT);

                            this.notificationSubscription = this.stompClient.subscribe(
                                USER_NOTI,
                                message => {
                                    console.log("🔔 Notification received:", message);
                                    try {
                                        const data = JSON.parse(message.body);
                                        console.log("📨 Parsed notification:", data);
                                        
                                        // Notify all registered notification handlers
                                        this.notificationHandlers.forEach(handler => handler(data));
                                    } catch (error) {
                                        console.error("Error parsing notification:", error);
                                    }   
                                },
                                { id: 'notification-subscription-' + new Date().getTime() }
                            );
                            console.log('Successfully subscribed to NOTIFICATION CHANNEL:', USER_NOTI);
                            
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
            this.chatHandlers = [];
            this.notificationHandlers = [];

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
            this.chatSubscription = null;
            this.notificationSubscription = null;
        }
    }
    
    // Send a chat message via WebSocket
    sendChatMessage(senderId, chatId, content) {
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
            
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }
    
    // Check if connected
    isConnected() {
        return this.connected && this.stompClient && this.stompClient.active;
    }
    
    // Get connection status
    getConnectionStatus() {
        return {
            connected: this.connected,
            active: this.stompClient?.active || false
        };
    }
}
export default new WebSocketService();