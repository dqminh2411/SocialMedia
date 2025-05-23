import React from 'react';
import styles from '../assets/css/FriendSuggestion.module.css';

const FriendSuggestion = ({ avatar, username }) => {
    return (
        <li className={styles.listFriend}>
            <img src={avatar} alt={username} className={styles.avatar} />
            <div className={styles.userInfo}>
                <p>{username}</p>
            </div>
            <button className={styles.button}>Follow</button>
        </li>
    );
};

export default FriendSuggestion;
