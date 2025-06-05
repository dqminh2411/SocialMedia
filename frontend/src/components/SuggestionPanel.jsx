import React, { useEffect, useState } from 'react';
import styles from '../assets/css/SuggestionPanel.module.css';
import FriendSuggestion from './FriendSuggestion';
import UserService from '../services/user.service';
import NotificationService from '../services/notification.service';
import AuthService from '../services/auth.service.jsx';
const SuggestionPanel = () => {
    const [suggestions, setSuggestions] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUser = AuthService.getCurrentUser();
    useEffect(() => {
        
        const fetchData = async () => {
            try {
                setLoading(true);

                
                const suggestionsData = await UserService.getSuggestedUsers(currentUser.user.id);

                
                const sentRequestsData = await NotificationService.getSentFollowRequests();

                
                const sentRequestIds = sentRequestsData.map(request => request.recipientId);
                

                
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

    
    const handleFollowRequestSent = (userId) => {
        
        

        
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
