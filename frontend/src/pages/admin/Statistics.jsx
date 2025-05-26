// src/pages/admin/Statistics.jsx
import React, { useState, useEffect } from 'react';
import AdminService from '../../services/admin.service';
import AdminLayout from '../../components/admin/AdminLayout';
import styles from '../../assets/css/AdminStatistics.module.css';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
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

const Statistics = () => {
    const [userStats, setUserStats] = useState(null);
    const [postStats, setPostStats] = useState(null);
    const [activityStats, setActivityStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('month'); // 'week', 'month', 'year'
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'posts', 'activity'

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);

            try {
                // Only fetch the stats for the active tab to improve performance
                if (activeTab === 'users') {
                    // await
                    const response = AdminService.getMockUserStats(period);

                    // setUserStats(response.data.data);
                    setUserStats(response);
                } else if (activeTab === 'posts') {
                    const response = AdminService.getMockPostStats(period);
                    // setPostStats(response.data.data);
                    setPostStats(response);
                } else if (activeTab === 'activity') {
                    const response = AdminService.getMockActivityStats(period);
                    // setActivityStats(response.data.data);
                    setActivityStats(response);
                }
            } catch (error) {
                console.error('Error fetching statistics:', error);
                setError('Failed to load statistics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [period, activeTab]);

    const handlePeriodChange = (e) => {
        setPeriod(e.target.value);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // User statistics chart data (placeholder)
    const userRegistrationData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'New Users',
                data: [65, 59, 80, 81, 56, 55, 40, 65, 70, 80, 85, 90],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1
            }
        ]
    };

    const userDemographicsData = {
        labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
        datasets: [
            {
                label: 'Age Distribution',
                data: [35, 40, 15, 7, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1
            }
        ]
    };

    const userActivityData = {
        labels: ['Very Active', 'Active', 'Moderate', 'Low', 'Inactive'],
        datasets: [
            {
                label: 'User Activity Levels',
                data: [15, 30, 25, 20, 10],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.5)',
                    'rgba(33, 150, 243, 0.5)',
                    'rgba(255, 152, 0, 0.5)',
                    'rgba(158, 158, 158, 0.5)',
                    'rgba(244, 67, 54, 0.5)',
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(33, 150, 243, 1)',
                    'rgba(255, 152, 0, 1)',
                    'rgba(158, 158, 158, 1)',
                    'rgba(244, 67, 54, 1)',
                ],
                borderWidth: 1
            }
        ]
    };

    // Post statistics chart data (placeholder)
    const postCreationData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'New Posts',
                data: [150, 200, 180, 220, 280, 300, 280, 290, 310, 330, 360, 380],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            }
        ]
    };

    const postTypeData = {
        labels: ['Image', 'Video', 'Multiple Images', 'Text-only'],
        datasets: [
            {
                label: 'Post Types',
                data: [60, 25, 10, 5],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1
            }
        ]
    };

    const postPopularityData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                type: 'line',
                label: 'Average Likes per Post',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 2,
                fill: false,
                data: [25, 30, 35, 40, 45, 50],
                yAxisID: 'y-axis-1',
            },
            {
                type: 'bar',
                label: 'Average Comments per Post',
                backgroundColor: 'rgb(75, 192, 192)',
                data: [5, 7, 8, 10, 12, 15],
                yAxisID: 'y-axis-2',
            }
        ]
    };

    // Activity statistics chart data (placeholder)
    const activityOverTimeData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Likes',
                data: [1200, 1300, 1400, 1500, 1700, 1900, 2000, 2200, 2400, 2600, 2800, 3000],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1
            },
            {
                label: 'Comments',
                data: [300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.1
            },
            {
                label: 'Shares',
                data: [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320],
                borderColor: 'rgb(255, 206, 86)',
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                tension: 0.1
            }
        ]
    };

    const userEngagementData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Daily Active Users',
                data: [700, 750, 800, 780, 820, 900, 850],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1
            }
        ]
    };

    const peakHoursData = {
        labels: ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'],
        datasets: [
            {
                label: 'Activity by Hour',
                data: [10, 5, 3, 7, 20, 30, 45, 50, 60, 65, 55, 35],
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgb(153, 102, 255)',
                borderWidth: 1
            }
        ]
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
            <div className={styles.statisticsContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Statistics</h1>

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

                <div className={styles.tabsContainer}>
                    <div
                        className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
                        onClick={() => handleTabChange('users')}
                    >
                        <i className="fas fa-users"></i>
                        User Statistics
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === 'posts' ? styles.active : ''}`}
                        onClick={() => handleTabChange('posts')}
                    >
                        <i className="fas fa-image"></i>
                        Post Statistics
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === 'activity' ? styles.active : ''}`}
                        onClick={() => handleTabChange('activity')}
                    >
                        <i className="fas fa-chart-line"></i>
                        Activity Statistics
                    </div>
                </div>

                {/* User Statistics */}
                {activeTab === 'users' && (
                    <div className={styles.tabContent}>
                        <div className={styles.statsOverview}>
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-user-plus"></i>
                                    <h3>Total Users</h3>
                                </div>
                                <p className={styles.statValue}>1,245</p>
                                <p className={`${styles.statChange} ${styles.positive}`}>+12.5% from last period</p>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-user-check"></i>
                                    <h3>Active Users</h3>
                                </div>
                                <p className={styles.statValue}>987</p>
                                <p className={`${styles.statChange} ${styles.positive}`}>+8.2% from last period</p>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-user-clock"></i>
                                    <h3>New Users</h3>
                                </div>
                                <p className={styles.statValue}>124</p>
                                <p className={`${styles.statChange} ${styles.positive}`}>+15.7% from last period</p>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-user-slash"></i>
                                    <h3>Inactive Users</h3>
                                </div>
                                <p className={styles.statValue}>258</p>
                                <p className={`${styles.statChange} ${styles.negative}`}>+3.2% from last period</p>
                            </div>
                        </div>

                        <div className={styles.chartsContainer}>
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>User Growth</h3>
                                <div className={styles.chart}>
                                    <Line data={userRegistrationData} />
                                </div>
                            </div>

                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Age Demographics</h3>
                                <div className={styles.chart}>
                                    <Pie data={userDemographicsData} />
                                </div>
                            </div>

                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>User Activity Levels</h3>
                                <div className={styles.chart}>
                                    <Doughnut data={userActivityData} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Post Statistics */}
                {activeTab === 'posts' && (
                    <div className={styles.tabContent}>
                        <div className={styles.statsOverview}>
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-images"></i>
                                    <h3>Total Posts</h3>
                                </div>
                                <p className={styles.statValue}>8,732</p>
                                <p className={`${styles.statChange} ${styles.positive}`}>+8.2% from last period</p>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-plus-square"></i>
                                    <h3>New Posts</h3>
                                </div>
                                <p className={styles.statValue}>1,245</p>
                                <p className={`${styles.statChange} ${styles.positive}`}>+12.5% from last period</p>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-heart"></i>
                                    <h3>Most Liked</h3>
                                </div>
                                <p className={styles.statValue}>1,287 likes</p>
                                <p className={styles.statChange}>on a single post</p>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-comment"></i>
                                    <h3>Most Commented</h3>
                                </div>
                                <p className={styles.statValue}>342 comments</p>
                                <p className={styles.statChange}>on a single post</p>
                            </div>
                        </div>

                        <div className={styles.chartsContainer}>
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Post Creation Trend</h3>
                                <div className={styles.chart}>
                                    <Bar data={postCreationData} />
                                </div>
                            </div>

                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Post Types</h3>
                                <div className={styles.chart}>
                                    <Doughnut data={postTypeData} />
                                </div>
                            </div>

                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Post Engagement</h3>
                                <div className={styles.chart}>
                                    <Bar
                                        data={postPopularityData}
                                        options={{
                                            scales: {
                                                'y-axis-1': {
                                                    position: 'left',
                                                    title: {
                                                        display: true,
                                                        text: 'Likes'
                                                    }
                                                },
                                                'y-axis-2': {
                                                    position: 'right',
                                                    title: {
                                                        display: true,
                                                        text: 'Comments'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Statistics */}
                {activeTab === 'activity' && (
                    <div className={styles.tabContent}>
                        <div className={styles.statsOverview}>
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-heart"></i>
                                    <h3>Total Likes</h3>
                                </div>
                                <p className={styles.statValue}>45,289</p>
                                <p className={`${styles.statChange} ${styles.positive}`}>+15.7% from last period</p>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-comment"></i>
                                    <h3>Total Comments</h3>
                                </div>
                                <p className={styles.statValue}>12,456</p>
                                <p className={`${styles.statChange} ${styles.negative}`}>-3.2% from last period</p>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-share"></i>
                                    <h3>Total Shares</h3>
                                </div>
                                <p className={styles.statValue}>3,789</p>
                                <p className={`${styles.statChange} ${styles.positive}`}>+5.8% from last period</p>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <i className="fas fa-user-friends"></i>
                                    <h3>Avg. Interactions</h3>
                                </div>
                                <p className={styles.statValue}>7.2</p>
                                <p className={`${styles.statChange} ${styles.positive}`}>+2.1% from last period</p>
                            </div>
                        </div>

                        <div className={styles.chartsContainer}>
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Activity Over Time</h3>
                                <div className={styles.chart}>
                                    <Line data={activityOverTimeData} />
                                </div>
                            </div>

                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Daily Active Users</h3>
                                <div className={styles.chart}>
                                    <Line data={userEngagementData} />
                                </div>
                            </div>

                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Peak Activity Hours</h3>
                                <div className={styles.chart}>
                                    <Bar data={peakHoursData} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Statistics;
