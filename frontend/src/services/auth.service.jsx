import api, { resetLogoutFlag } from './api.js';


class AuthService {
    login(email, password) {
        console.log('Auth service login attempt with:', email);
        return api
            .post('/auth/login', {
                email,
                password
            })
            .then(response => {
                console.log('Login API response:', response.data);
                if (response.data.data) {
                    const userData = {
                        user: response.data.data.userDTO,
                        accessToken: response.data.data.accessToken
                    };

                    // Reset logout flag on successful login
                    resetLogoutFlag();
                    return userData;
                } else {
                    console.warn('Login response missing data property');
                }
                return null;
            });

    }

    getSocialLoginPage(loginType) {
        return api.get('/auth/social-login', {
            params: { loginType }
        })
            .then(response => response.data.data)
            .catch(error => {
                console.error(error);
                throw error;
            })
    }

    socialLogin(code, loginType) {
        return api.post("/auth/social/callback", null, {
            params: { code, loginType }
        })
            .then(response => {
                if (response.data.data) {
                    console.log('Social login page data:', response.data.data);
                    const userData = {
                        user: response.data.data.userDTO,
                        accessToken: response.data.data.accessToken
                    }
                    localStorage.setItem('user', JSON.stringify(userData));
                    // Reset logout flag on successful social login
                    resetLogoutFlag();
                } else {
                    console.warn('Social login response missing data property');
                }
                return response.data.data;
            })
            .catch(error => {
                console.error(error);
                throw error;
            });
    }

    logout() {
        localStorage.removeItem('user');
    }

    signup(formData) {
        return api.post('/users/signup', {
            fullname: formData.fullname,
            email: formData.email,
            password: formData.password,
            rePassword: formData.rePassword
        });
    }
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.log('No user found in localStorage');
                return null;
            }
            const user = JSON.parse(userStr);

            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    getAuthHeader() {
        const user = this.getCurrentUser();

        if (user && user.accessToken) {
            return { Authorization: 'Bearer ' + user.accessToken };
        } else {
            return {};
        }
    }
    sendResetPasswordEmail(email) {
        return api.post('/forgot-password/email', { email })
            .then(response => {
                console.log('Reset password email sent:', response.data);
                return response.data;
            })
            .catch(error => {
                console.error('Error sending reset password email:', error);
                throw error;
            });
    }

}

export default new AuthService();
