import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import WebSocketService from '../services/websocket.service';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const { currentUser } = useAuth();

    console.log("WebSocketProvider rendered, currentUser: ", currentUser);
    useEffect(() => {
        if (!currentUser) {
            setIsConnected(false);
            return;
        }

        const connectWebSocket = async () => {
            try {
                console.log("Connecting to WebSocket for user:", currentUser.user?.id);
                await WebSocketService.connect();
                setIsConnected(true);
                console.log("WebSocket connected for user:", currentUser.user?.id);
            } catch (error) {
                console.error("WebSocket connection error:", error);
                setIsConnected(false);
                // Retry connection after 5 seconds
                setTimeout(connectWebSocket, 5000);
            }
        };

        connectWebSocket();

        // Periodic connection check
        const checkConnection = () => {
            const connected = WebSocketService.isConnected();
            setIsConnected(connected);
            
            if (!connected) {
                console.log("WebSocket disconnected, attempting to reconnect...");
                connectWebSocket();
            }
        };
        
        const connectionCheckInterval = setInterval(checkConnection, 30000);

        return () => {
            console.log("Cleaning up WebSocket for user:", currentUser.user?.id);
            clearInterval(connectionCheckInterval);
            WebSocketService.disconnect();
        };
    }, [currentUser?.user?.id]);

    // Function to register chat message handlers
    const onChatMessage = useCallback((handler) => {
        return WebSocketService.onChatMessage(handler);
    }, []);

    // Function to register notification handlers
    const onNotification = useCallback((handler) => {
        return WebSocketService.onNotification(handler);
    }, []);

    // Function to send chat messages
    const sendChatMessage = useCallback((senderId, chatId, content) => {
        return WebSocketService.sendChatMessage(senderId, chatId, content);
    }, []);

    return (
        <WebSocketContext.Provider value={{
            isConnected,
            onChatMessage,
            onNotification,
            sendChatMessage
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);