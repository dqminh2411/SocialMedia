
import api from './api.js';

class AdminService {
    login(username, password) {
        console.log('Admin auth service login attempt with:', username);
        return api
            .post('/auth/login', {
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
    getDashboardStats() {
        return api.get('/admin/dashboard', { headers: this.getAuthHeader() })
            .then(response => response.data.data)
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
            console.log('accesstoken    ' + admin.accessToken);
            return { Authorization: 'Bearer ' + admin.accessToken };
        } else {
            return {};
        }
    }


    getUsers(page = 0, size = 10, search = '') {
        try {
            return api.get('/admin/users', {
                params: { page, size, search },
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.warn('API call failed, returning mock data');

        }
    }

    getUserById(id) {
        try {
            return api.get(`/admin/users/${id}`, {
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
        return api.put(`/admin/users/${id}`, userData, {
            headers: this.getAuthHeader()
        }).then(response => {
            console.log('User updated successfully:', response.data.data);
            return response.data.data;
        })
    }

    deleteUser(id) {
        return api.delete(`/admin/users/${id}`, {
            headers: this.getAuthHeader()
        });
    }




    getPosts(page = 0, size = 10, search = '') {
        try {
            return api.get('/admin/posts', {
                params: { page, size, search },
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.error('API call failed');

        }
    }

    getPostById(id) {
        try {
            return api.get(`/admin/posts/${id}`, {
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.warn('API call failed');

        }
    }

    updatePost(id, postData) {
        return api.put(`/admin/posts/${id}`, postData, {
            headers: this.getAuthHeader()
        });
    }

    deletePost(id) {
        return api.delete(`/admin/posts/${id}`, {
            headers: this.getAuthHeader()
        });
    }


}

export default new AdminService();
