// src/services/admin.service.jsx
import axios from 'axios';

const API_URL = 'http://localhost:8080/admin/';

class AdminService {
    login(username, password) {
        console.log('Admin auth service login attempt with:', username);
        return axios
            .post('http://localhost:8080/auth/login', {
                email: username,
                password: password,
            })
            .then(response => {
                console.log('Admin login API response:', response.data);
                if (response.data.data) {
                    const adminData = {
                        username,
                        role: 'ADMIN',
                        accessToken: response.data.data.accessToken
                    };
                    console.log('Storing admin data:', adminData);
                    localStorage.setItem('admin', JSON.stringify(adminData));
                } else {
                    console.warn('Admin login response missing data property');
                }
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem('admin');
    }

    getCurrentAdmin() {
        try {
            const adminStr = localStorage.getItem('admin');
            if (!adminStr) {
                console.log('No admin found in localStorage');
                return null;
            }
            const admin = JSON.parse(adminStr);
            console.log('Current admin from localStorage:', admin);
            return admin;
        } catch (error) {
            console.error('Error getting current admin:', error);
            return null;
        }
    }

    getAuthHeader() {
        const admin = this.getCurrentAdmin();
        if (admin && admin.accessToken) {
            return { Authorization: 'Bearer ' + admin.accessToken };
        } else {
            return {};
        }
    }

    // User management
    getUsers(page = 0, size = 10, search = '') {
        try {
            return axios.get(API_URL + 'users', {
                params: { page, size, search },
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.warn('API call failed, returning mock data');
            return Promise.resolve({ data: this.getMockUsers(page, size, search) });
        }
    }

    getUserById(id) {
        try {
            return axios.get(API_URL + `users/${id}`, {
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.warn('API call failed, returning mock data');
            const mockUsers = this.getMockUsers().data;
            const user = mockUsers.content.find(user => user.id === parseInt(id));
            return Promise.resolve({ data: { data: user } });
        }
    }

    updateUser(id, userData) {
        return axios.put(API_URL + `users/${id}`, userData, {
            headers: this.getAuthHeader()
        });
    }

    deleteUser(id) {
        return axios.delete(API_URL + `users/${id}`, {
            headers: this.getAuthHeader()
        });
    }

    getMockUsers(page = 0, size = 10, search = '') {
        // Generate 100 mock users
        const totalUsers = 100;
        const mockUsers = [];

        for (let i = 1; i <= totalUsers; i++) {
            mockUsers.push({
                id: i,
                username: `user${i}`,
                email: `user${i}@example.com`,
                fullName: `User ${i}`,
                profilePicture: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i % 70 + 1}.jpg`,
                bio: `This is the bio for User ${i}`,
                role: i % 50 === 0 ? 'ADMIN' : 'USER',
                status: i % 10 === 0 ? 'INACTIVE' : 'ACTIVE',
                createdAt: new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
                postCount: Math.floor(Math.random() * 50),
                followerCount: Math.floor(Math.random() * 1000),
                followingCount: Math.floor(Math.random() * 500)
            });
        }

        // Filter by search term if provided
        let filteredUsers = mockUsers;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredUsers = mockUsers.filter(
                user => user.username.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    user.fullName.toLowerCase().includes(searchLower)
            );
        }

        // Paginate
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        return {
            data: {
                content: paginatedUsers,
                pageable: {
                    pageNumber: page,
                    pageSize: size
                },
                totalElements: filteredUsers.length,
                totalPages: Math.ceil(filteredUsers.length / size),
                last: endIndex >= filteredUsers.length,
                first: page === 0,
                empty: paginatedUsers.length === 0
            }
        };
    }

    // Post management
    getPosts(page = 0, size = 10, search = '') {
        try {
            return axios.get(API_URL + 'posts', {
                params: { page, size, search },
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.warn('API call failed, returning mock data');
            return Promise.resolve({ data: this.getMockPosts(page, size, search) });
        }
    }

    getPostById(id) {
        try {
            return axios.get(API_URL + `posts/${id}`, {
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.warn('API call failed, returning mock data');
            const mockPosts = this.getMockPosts().data;
            const post = mockPosts.content.find(post => post.id === parseInt(id));
            return Promise.resolve({ data: { data: post } });
        }
    }

    updatePost(id, postData) {
        return axios.put(API_URL + `posts/${id}`, postData, {
            headers: this.getAuthHeader()
        });
    }

    deletePost(id) {
        return axios.delete(API_URL + `posts/${id}`, {
            headers: this.getAuthHeader()
        });
    }

    getMockPosts(page = 0, size = 10, search = '') {
        // Generate 200 mock posts
        const totalPosts = 200;
        const mockPosts = [];

        const postTypes = ['IMAGE', 'VIDEO', 'MULTIPLE_IMAGES', 'TEXT'];
        const captions = [
            'Enjoying a beautiful day! #sunshine',
            'New adventure begins! #excited',
            'Just finished my project #proud',
            'Meeting with friends #goodtimes',
            'Look at this view! #nature',
            'My new purchase #shopping',
            'Throwback to last summer #memories',
            'Monday motivation #workout',
            'Delicious meal #foodie',
            'Family time #blessed'
        ];

        for (let i = 1; i <= totalPosts; i++) {
            const createdAt = new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000));
            const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
            const likesCount = Math.floor(Math.random() * 1000);
            const commentsCount = Math.floor(Math.random() * 100);
            const sharesCount = Math.floor(Math.random() * 50);

            mockPosts.push({
                id: i,
                userId: Math.floor(Math.random() * 100) + 1,
                username: `user${Math.floor(Math.random() * 100) + 1}`,
                userProfilePicture: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i % 70 + 1}.jpg`,
                type: postType,
                caption: captions[Math.floor(Math.random() * captions.length)],
                mediaUrls: postType === 'TEXT' ? [] : [
                    `https://picsum.photos/id/${(i % 1000) + 1}/500/500`
                ],
                likesCount,
                commentsCount,
                sharesCount,
                status: i % 20 === 0 ? 'HIDDEN' : 'ACTIVE',
                createdAt: createdAt.toISOString(),
                updatedAt: new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            });
        }

        // Filter by search term if provided
        let filteredPosts = mockPosts;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredPosts = mockPosts.filter(
                post => post.caption.toLowerCase().includes(searchLower) ||
                    post.username.toLowerCase().includes(searchLower)
            );
        }

        // Paginate
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        return {
            data: {
                content: paginatedPosts,
                pageable: {
                    pageNumber: page,
                    pageSize: size
                },
                totalElements: filteredPosts.length,
                totalPages: Math.ceil(filteredPosts.length / size),
                last: endIndex >= filteredPosts.length,
                first: page === 0,
                empty: paginatedPosts.length === 0
            }
        };
    }

    // Statistics
    getUserStats(period = 'month') {
        try {
            return axios.get(API_URL + 'stats/users', {
                params: { period },
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.warn('API call failed, returning mock data');
            return Promise.resolve({ data: { data: this.getMockUserStats(period) } });
        }
    }

    getPostStats(period = 'month') {
        try {
            return axios.get(API_URL + 'stats/posts', {
                params: { period },
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.warn('API call failed, returning mock data');
            return Promise.resolve({ data: { data: this.getMockPostStats(period) } });
        }
    }

    getActivityStats(period = 'month') {
        try {
            return axios.get(API_URL + 'stats/activity', {
                params: { period },
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.warn('API call failed, returning mock data');
            return Promise.resolve({ data: { data: this.getMockActivityStats(period) } });
        }
    }

    getMockUserStats(period) {
        const currentDate = new Date();
        let labels = [];
        let growthData = [];

        // Create period-appropriate labels and data
        if (period === 'week') {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            labels = Array(7).fill().map((_, i) => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() - 6 + i);
                return days[d.getDay()];
            });
            growthData = [12, 19, 15, 17, 23, 28, 25];
        } else if (period === 'month') {
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            labels = Array(daysInMonth).fill().map((_, i) => `Day ${i + 1}`);
            growthData = Array(daysInMonth).fill().map(() => Math.floor(Math.random() * 30) + 5);
        } else { // year
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            labels = months;
            growthData = [65, 59, 80, 81, 56, 55, 40, 65, 70, 80, 85, 90];
        }

        return {
            overview: {
                totalUsers: 1245,
                activeUsers: 987,
                newUsers: period === 'week' ? 48 : period === 'month' ? 124 : 890,
                inactiveUsers: 258,
                growthRate: 12.5,
                activeRate: 8.2,
                newUserRate: 15.7,
                inactiveRate: 3.2
            },
            userGrowth: {
                labels,
                data: growthData
            },
            demographics: {
                labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
                data: [35, 40, 15, 7, 3]
            },
            activityLevels: {
                labels: ['Very Active', 'Active', 'Moderate', 'Low', 'Inactive'],
                data: [15, 30, 25, 20, 10]
            }
        };
    }

    getMockPostStats(period) {
        const currentDate = new Date();
        let labels = [];
        let creationData = [];

        // Create period-appropriate labels and data
        if (period === 'week') {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            labels = Array(7).fill().map((_, i) => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() - 6 + i);
                return days[d.getDay()];
            });
            creationData = [45, 60, 75, 65, 80, 95, 85];
        } else if (period === 'month') {
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            labels = Array(daysInMonth).fill().map((_, i) => `Day ${i + 1}`);
            creationData = Array(daysInMonth).fill().map(() => Math.floor(Math.random() * 70) + 30);
        } else { // year
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            labels = months;
            creationData = [150, 200, 180, 220, 280, 300, 280, 290, 310, 330, 360, 380];
        }

        return {
            overview: {
                totalPosts: 8732,
                newPosts: period === 'week' ? 185 : period === 'month' ? 1245 : 5400,
                mostLikedPostId: 42,
                mostLikedCount: 1287,
                mostCommentedPostId: 67,
                mostCommentedCount: 342,
                growthRate: 8.2,
                popularityRate: 12.5
            },
            postCreation: {
                labels,
                data: creationData
            },
            postTypes: {
                labels: ['Image', 'Video', 'Multiple Images', 'Text-only'],
                data: [60, 25, 10, 5]
            },
            engagement: {
                labels: labels.slice(0, 6), // Use first 6 labels for this chart
                likes: [25, 30, 35, 40, 45, 50],
                comments: [5, 7, 8, 10, 12, 15]
            }
        };
    }

    getMockActivityStats(period) {
        const currentDate = new Date();
        let labels = [];
        let likesData = [];
        let commentsData = [];
        let sharesData = [];

        // Create period-appropriate labels and data
        if (period === 'week') {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            labels = Array(7).fill().map((_, i) => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() - 6 + i);
                return days[d.getDay()];
            });
            likesData = [1200, 1400, 1300, 1500, 1700, 1800, 1600];
            commentsData = [300, 350, 325, 375, 400, 450, 425];
            sharesData = [100, 120, 110, 130, 150, 140, 125];
        } else if (period === 'month') {
            // For month, use weeks
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            likesData = [5000, 5500, 6000, 6500];
            commentsData = [1200, 1300, 1400, 1500];
            sharesData = [400, 450, 500, 550];
        } else { // year
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            labels = months;
            likesData = [1200, 1300, 1400, 1500, 1700, 1900, 2000, 2200, 2400, 2600, 2800, 3000];
            commentsData = [300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850];
            sharesData = [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320];
        }

        return {
            overview: {
                totalLikes: 45289,
                totalComments: 12456,
                totalShares: 3789,
                avgInteractions: 7.2,
                likesRate: 15.7,
                commentsRate: -3.2,
                sharesRate: 5.8,
                interactionsRate: 2.1
            },
            activityOverTime: {
                labels,
                likes: likesData,
                comments: commentsData,
                shares: sharesData
            },
            userEngagement: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                data: [700, 750, 800, 780, 820, 900, 850]
            },
            peakHours: {
                labels: ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'],
                data: [10, 5, 3, 7, 20, 30, 45, 50, 60, 65, 55, 35]
            }
        };
    }
}

export default new AdminService();
