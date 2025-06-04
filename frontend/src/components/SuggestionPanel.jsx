import React, { useEffect, useState } from 'react';
import styles from '../assets/css/SuggestionPanel.module.css';
import FriendSuggestion from './FriendSuggestion';
import UserService from '../services/user.service';
import NotificationService from '../services/notification.service';
import AuthService from '../services/auth.service.jsx';
const SuggestionPanel = () => {
    const [suggestions, setSuggestions] = useState([]);
    //const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUser = AuthService.getCurrentUser();
    useEffect(() => {
        // Fetch both suggestions and sent follow requests
        const fetchData = async () => {
            try {
                setLoading(true);

                // Get suggestions
                const suggestionsData = await UserService.getSuggestedUsers(currentUser.user.id);

                // Get sent follow requests
                const sentRequestsData = await NotificationService.getSentFollowRequests();

                // Extract recipient IDs from sent requests
                const sentRequestIds = sentRequestsData.map(request => request.recipientId);
                //setSentRequests(sentRequestIds);

                // Filter suggestions to exclude users who already received follow requests
                const filteredSuggestions = suggestionsData.filter(
                    suggestion => !sentRequestIds.includes(suggestion.id)
                );

                setSuggestions(filteredSuggestions);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load suggestions");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Update suggestions when a new follow request is sent
    const handleFollowRequestSent = (userId) => {
        // Add to sent requests
        // setSentRequests(prev => [...prev, userId]);

        // Remove from suggestions
        setSuggestions(prev => prev.filter(suggestion => suggestion.id !== userId));
    };

    if (loading) {
        return <div className={styles.loading}>Loading suggestions...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.suggestionsPanel}>
            <div className={styles.header}>
                <h3>Suggested for you</h3>

            </div>
            {suggestions.length === 0 ? (
                <p className={styles.noSuggestions}>No suggestions available</p>
            ) : (
                <ul className={styles.suggestionsList}>
                    {suggestions.map(suggestion => (
                        <FriendSuggestion
                            key={suggestion.id}
                            id={suggestion.id}
                            username={suggestion.username}
                            avatar={suggestion.avatar}
                            onFollowRequestSent={() => handleFollowRequestSent(suggestion.id)}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SuggestionPanel;
