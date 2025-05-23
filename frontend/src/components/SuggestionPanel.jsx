import React from 'react';
import styles from '../assets/css/SuggestionPanel.module.css';
import FriendSuggestion from './FriendSuggestion';

// Import profile images
import profile1 from '../assets/images/anh1.png';
import profile2 from '../assets/images/anh2.png';
import profile3 from '../assets/images/anh3.png';
import profile4 from '../assets/images/anh4.png';
import profile5 from '../assets/images/anh5.png';
import profile6 from '../assets/images/anh6.png';
import profile7 from '../assets/images/anh7.png';
import profile8 from '../assets/images/anh8.png';
import profile9 from '../assets/images/anh9.png';
import profile10 from '../assets/images/anh10.png';

const SuggestionPanel = () => {
    const suggestions = [
        { id: 1, username: 'hoangminhtrong04', avatar: profile1 },
        { id: 2, username: 'qingzhong04', avatar: profile2 },
        { id: 3, username: 'qingzhong05', avatar: profile3 },
        { id: 4, username: 'qingzhong06', avatar: profile4 },
        { id: 5, username: 'qingzhong07', avatar: profile5 },
        { id: 6, username: 'qingzhong08', avatar: profile6 },
        { id: 7, username: 'qingzhong09', avatar: profile7 },
        { id: 8, username: 'qingzhong00', avatar: profile8 },
        { id: 9, username: 'thanhtung04', avatar: profile9 },
        { id: 10, username: 'quyhoang36', avatar: profile10 },
    ];

    return (
        <div className={styles.suggestionPanel}>
            <h3 className={styles.title}>Suggested for you</h3>
            <ul className={styles.suggestionList}>
                {suggestions.map(suggestion => (
                    <FriendSuggestion
                        key={suggestion.id}
                        username={suggestion.username}
                        avatar={suggestion.avatar}
                    />
                ))}
            </ul>
        </div>
    );
};

export default SuggestionPanel;
