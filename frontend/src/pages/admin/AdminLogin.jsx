// src/pages/admin/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import styles from '../../assets/css/AdminLogin.module.css';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login, currentAdmin } = useAdmin();

    // Check if we should redirect to a specific page after login
    const from = location.state?.from || '/admin/dashboard';

    useEffect(() => {
        console.log('Admin Login page - location state:', location.state);
        console.log('Redirect after admin login target:', from);
    }, [location, from]);

    // If admin is already authenticated, redirect to admin dashboard
    useEffect(() => {
        if (currentAdmin) {
            console.log('Admin already logged in, redirecting to:', from);
            navigate(from, { replace: true });
        }
    }, [currentAdmin, navigate, from]);

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('Admin login attempt with:', username);
        setMessage('');

        try {
            const admin = await login(username, password);
            console.log('Admin login successful, admin:', admin);
            console.log('Redirecting to:', from);
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Admin login error:', error);
            setMessage(error.response?.data?.message || error.message || 'Admin login failed');
        }
    }

    return (
        <div className={styles.adminLoginContainer}>
            <div className={styles.loginBox}>
                <h1 className={styles.title}>Outstagram Admin Login</h1>
                <form onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Admin Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {message && <div className={styles.errorMessage}>{message}</div>}

                    <button type="submit" className={styles.loginButton}>
                        Login
                    </button>
                </form>

                <div className={styles.backLink}>
                    <a href="/">Back to main site</a>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
