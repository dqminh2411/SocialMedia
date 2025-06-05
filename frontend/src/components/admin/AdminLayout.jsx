
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import styles from '../../assets/css/AdminLayout.module.css';

const AdminLayout = ({ children }) => {
    const { currentAdmin, logout } = useAdmin();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className={styles.adminContainer}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h1>Admin Panel</h1>
                </div>

                <nav className={styles.sidebarNav}>
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) =>
                            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                        }
                    >
                        <i className="fas fa-tachometer-alt"></i>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                        }
                    >
                        <i className="fas fa-users"></i>
                        User Management
                    </NavLink>

                    <NavLink
                        to="/admin/posts"
                        className={({ isActive }) =>
                            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                        }
                    >
                        <i className="fas fa-image"></i>
                        Post Management
                    </NavLink>


                </nav>

                <div className={styles.sidebarFooter}>
                    {currentAdmin && (
                        <div className={styles.adminInfo}>
                            <span className={styles.adminName}>{currentAdmin.username}</span>
                            <span className={styles.adminRole}>Administrator</span>
                        </div>
                    )}
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
