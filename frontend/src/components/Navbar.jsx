
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../assets/css/Navbar.module.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const handleLogout = () => {
        console.log('Logging out user:', currentUser?.email);
        logout();
        navigate('/login');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <Link to="/" className={styles.navLogo}>
                    <h1>Insta</h1>
                </Link>

                {currentUser ? (
                    <div className={styles.navMenu}>
                        <span className={styles.userEmail}>{currentUser.email}</span>
                        <button className={styles.logoutButton} onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className={styles.navMenu}>
                        <Link to="/login" className={styles.navLink}>
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

