// src/services/auth.service.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/auth/';

class AuthService {
     login(email, password) {

            return axios
                .post(API_URL + 'login', {
                    email,
                    password
                })
                .then(response => {
                    if (response.data.data) {
                        localStorage.setItem('user', JSON.stringify({
                            email,
                            accessToken: response.data.data.accessToken
                        }));
                    }
                    return response.data;
                });

    }

    logout() {
        localStorage.removeItem('user');
    }

    register(email, password) {
        return axios.post(API_URL + 'register', {
            email,
            password
        });
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    getAuthHeader() {
        const user = this.getCurrentUser();

        if (user && user.accessToken) {
            return { Authorization: 'Bearer ' + user.accessToken };
        } else {
            return {};
        }
    }
}

export default new AuthService();