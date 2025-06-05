
import React from 'react';
import styles from '../assets/css/LoadingSpinner.module.css';

const LoadingSpinner = () => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
        </div>
    );
};

export default LoadingSpinner;
