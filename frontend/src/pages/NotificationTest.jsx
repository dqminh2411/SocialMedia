import React, { useEffect, useState } from 'react';
import NotificationService from '../services/notification.service';
import AuthService from '../services/auth.service';

const NotificationTest = () => {
    const [connected, setConnected] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');
    const [notifications, setNotifications] = useState([]);
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        if (!currentUser) return;

        const connectToWebSocket = async () => {
            try {
                await NotificationService.connect(currentUser.user.email);
                setConnected(true);
                console.log("WebSocket connected in test component");
            } catch (error) {
                console.error("Failed to connect to WebSocket:", error);
            }
        };

        connectToWebSocket();

        
        const unsubscribe = NotificationService.onMessage(notification => {
            console.log("Test component received notification:", notification);
            setNotifications(prev => [notification, ...prev]);
        });

        return () => {
            unsubscribe();
            NotificationService.disconnect();
        };
    }, [currentUser]);

    const sendTestNotification = async (e) => {
        e.preventDefault();

        try {
            
            await fetch('http:
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.accessToken}`
                },
                body: JSON.stringify({
                    recipient: {
                        email: recipient
                    },
                    content: message,
                    sender: {
                        email: currentUser.user.email
                    }
                })
            });

            setMessage('');
        } catch (error) {
            console.error("Error sending test notification:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h2>WebSocket Notification Test</h2>

            <div className="card mb-4">
                <div className="card-header">
                    WebSocket Status: {connected ?
                        <span className="text-success">Connected</span> :
                        <span className="text-danger">Disconnected</span>
                    }
                </div>
                <div className="card-body">
                    <form onSubmit={sendTestNotification}>
                        <div className="mb-3">
                            <label className="form-label">Recipient Email:</label>
                            <input
                                type="email"
                                className="form-control"
                                value={recipient}
                                onChange={e => setRecipient(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Message:</label>
                            <input
                                type="text"
                                className="form-control"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!connected}
                        >
                            Send Test Notification
                        </button>
                    </form>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    Received Notifications ({notifications.length})
                </div>
                <div className="card-body">
                    {notifications.length === 0 ? (
                        <p className="text-muted">No notifications received yet.</p>
                    ) : (
                        <ul className="list-group">
                            {notifications.map((notification, index) => (
                                <li key={index} className="list-group-item">
                                    <strong>From:</strong> {notification.sender?.email || 'Unknown'}<br />
                                    <strong>Message:</strong> {notification.content}<br />
                                    <strong>Time:</strong> {new Date().toLocaleTimeString()}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationTest;
