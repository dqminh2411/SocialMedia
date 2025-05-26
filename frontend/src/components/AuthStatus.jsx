// src/components/AuthStatus.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthStatus = () => {
    const { currentUser, loading } = useAuth();

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '5px',
            zIndex: 9999
        }}>
            <h3>Auth Debug:</h3>
            <p>Loading: {loading ? 'true' : 'false'}</p>
            <p>Authenticated: {currentUser ? 'true' : 'false'}</p>
            {currentUser && (
                <p>User: {currentUser.email}</p>
            )}
        </div>
    );
};

export default AuthStatus;
