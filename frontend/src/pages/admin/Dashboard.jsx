// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import AdminService from '../../services/admin.service';
import AdminLayout from '../../components/admin/AdminLayout';
import styles from '../../assets/css/AdminDashboard.module.css';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

// Register ChartJS components
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
    const [userStats, setUserStats] = useState(null);
    const [postStats, setPostStats] = useState(null);
    const [activityStats, setActivityStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('month'); // 'week', 'month', 'year'

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);

            try {
                // const [userStatsResponse, postStatsResponse, activityStatsResponse] = await Promise.all([
                //     AdminService.getMockUserStats(period),
                //     AdminService.getMockPostStats(period),
                //     AdminService.getMockActivityStats(period)
                // ]);
                const userStatsResponse = AdminService.getMockUserStats(period);
                const postStatsResponse = AdminService.getMockPostStats(period);
                const activityStatsResponse = AdminService.getMockActivityStats(period);

                //.data.data
                setUserStats(userStatsResponse);
                setPostStats(postStatsResponse);
                setActivityStats(activityStatsResponse);
            } catch (error) {
                console.error('Error fetching statistics:', error);
                setError('Failed to load statistics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [period]);

    // This is a placeholder for the actual data that will come from your API
    // You should replace this with actual data processing from the API responses
    const userChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'New Users',
                data: [65, 59, 80, 81, 56, 55],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };

    const postChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'New Posts',
                data: [28, 48, 40, 19, 86, 27],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            }
        ]
    };

    const activityChartData = {
        labels: ['Likes', 'Comments', 'Shares'],
        datasets: [
            {
                label: 'User Activity',
                data: [300, 150, 100],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

    const handlePeriodChange = (e) => {
        setPeriod(e.target.value);
    };

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

                    <div className={styles.periodSelector}>
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
                    </div>
                </div>

                <div className={styles.statsCards}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconContainer}>
                            <i className="fas fa-users"></i>
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Total Users</h3>
                            <p className={styles.statValue}>1,245</p>
                            <p className={`${styles.statChange} ${styles.positive}`}>+12.5%</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconContainer}>
                            <i className="fas fa-image"></i>
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Total Posts</h3>
                            <p className={styles.statValue}>8,732</p>
                            <p className={`${styles.statChange} ${styles.positive}`}>+8.2%</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconContainer}>
                            <i className="fas fa-heart"></i>
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Likes</h3>
                            <p className={styles.statValue}>45,289</p>
                            <p className={`${styles.statChange} ${styles.positive}`}>+15.7%</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconContainer}>
                            <i className="fas fa-comment"></i>
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Comments</h3>
                            <p className={styles.statValue}>12,456</p>
                            <p className={`${styles.statChange} ${styles.negative}`}>-3.2%</p>
                        </div>
                    </div>
                </div>

                <div className={styles.chartsContainer}>
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>User Growth</h3>
                        <div className={styles.chart}>
                            <Line data={userChartData} />
                        </div>
                    </div>

                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>Post Creation</h3>
                        <div className={styles.chart}>
                            <Bar data={postChartData} />
                        </div>
                    </div>

                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>User Activity</h3>
                        <div className={styles.chart}>
                            <Doughnut data={activityChartData} />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
