import axios from 'axios';
import authHeader from './auth-header';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import React, { useState, useRef, useEffect } from "react";
import { Stomp } from "@stomp/stompjs";

const API_URL = 'http://localhost:8080/api/';

class NotificationService {
    constructor() {
        this.stompClient = null;
        this.subscription = null;
        this.connected = false;
        this.messageHandlers = [];
    }    // Connect to WebSocket with JWT authentication
    connect(email) {
        if (this.connected) return Promise.resolve();

        return new Promise((resolve, reject) => {
            try {
                // Get the token from authHeader
                const headers = authHeader();
                // Create a WebSocket connection
                const socket = new WebSocket("ws://localhost:8080/ws");

                this.stompClient = Stomp.over(socket);

                this.stompClient.connect(
                    headers,
                    (frame) => {
                        console.log('Connected to WebSocket: ' + frame);
                        this.connected = true;

                        // Subscribe to user-specific topic
                        // This should match the backend destination path exactly
                        this.subscription = this.stompClient.subscribe(
                            `/user/topic`, // This matches what the backend sends to
                            message => {
                                console.log("🔔 WebSocket message received:", message);
                                try {
                                    const notification = JSON.parse(message.body);
                                    console.log("📨 Parsed notification:", notification);

                                    // Call all registered handlers
                                    this.messageHandlers.forEach(handler => handler(notification));
                                } catch (error) {
                                    console.error("Error parsing notification:", error);
                                }
                            }
                        );

                        resolve();
                    },
                    (error) => {
                        console.error('Error connecting to WebSocket:', error);
                        this.connected = false;
                        reject(error);
                    }
                );
            } catch (error) {
                console.error('Error setting up WebSocket connection:', error);
                reject(error);
            }
        });
    }    // Disconnect from WebSocket
    disconnect() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        if (this.stompClient && this.connected) {
            this.stompClient.disconnect();
            this.connected = false;
        }
    }

    // Register a message handler
    onMessage(handler) {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
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
            API_URL + 'notifications/' + notificationId + '/accept',
            {},
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

    // Get all notifications for current user
    getNotifications(page = 0, size = 20) {
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