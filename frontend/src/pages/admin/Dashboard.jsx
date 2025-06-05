
import React, { useState, useEffect } from 'react';
import AdminService from '../../services/admin.service';
import AdminLayout from '../../components/admin/AdminLayout';
import styles from '../../assets/css/AdminDashboard.module.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('month'); 

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);

            try {
                const statsResp = await AdminService.getDashboardStats();
                setStats(statsResp);
                console.log("Fetched stats:", statsResp);


            } catch (error) {
                console.error('Error fetching statistics:', error);
                setError('Failed to load statistics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);



    if (loading) {
        return (
            <AdminLayout>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading statistics...</p>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{error}</p>
                    <button
                        className={styles.retryButton}
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className={styles.dashboardContainer}>
                <div className={styles.dashboardHeader}>
                    <h1 className={styles.dashboardTitle}>Dashboard</h1>


                    {/* <div className={styles.periodSelector}>
                        <label htmlFor="period">Time Period:</label>
                        <select
                            id="period"
                            value={period}
                            onChange={handlePeriodChange}
                            className={styles.periodSelect}
                        >
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="year">Last Year</option>
                        </select>
                    </div> */}
                </div>

                <div className={styles.statsCards}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconContainer}>
                            <i className="fas fa-users"></i>
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Total Users</h3>
                            <p className={styles.statValue}>{stats.totalUsers}</p>
                            {}
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconContainer}>
                            <i className="fas fa-image"></i>
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Total Posts</h3>
                            <p className={styles.statValue}>{stats.totalPosts}</p>
                            {}
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconContainer}>
                            <i className="fas fa-heart"></i>
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Post Likes</h3>
                            <p className={styles.statValue}>{stats.totalPostLikes}</p>
                            {}
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconContainer}>
                            <i className="fas fa-comment"></i>
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Comments</h3>
                            <p className={styles.statValue}>{stats.totalComments}</p>
                            {}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconContainer}>
                            <i className="fas fa-comment"></i>
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Hashtags</h3>
                            <p className={styles.statValue}>{stats.totalHashtags}</p>
                            {}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconContainer}>
                            <i className="fas fa-comment"></i>
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Chats</h3>
                            <p className={styles.statValue}>{stats.totalChats}</p>
                            {}
                        </div>
                    </div>
                </div>


            </div>
        </AdminLayout>
    );
};

export default Dashboard;
