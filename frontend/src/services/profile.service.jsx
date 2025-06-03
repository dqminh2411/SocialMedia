// d:\hoc tap ptit\sem2 year3\basic internship\SocialMedia\frontend\src\services\profile.service.jsx
import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/';

class ProfileService {
    // Get user profile by userId
    getUserProfile(userId) {
        return axios.get(API_URL + 'profile/' + userId, { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }
    getUserProfileByUsername(username) {
        return axios.get(API_URL + 'profile/un/' + username, { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }
    // Update user profile
    updateUserProfile(profileData) {
        return axios.put(
            'http://localhost:8080/users/profile/update',
            profileData,
            {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
            .then(response => {
                return response.data;
            });
    }    // Get user posts
    getUserPosts(userId) {
        return axios.get(API_URL + 'profile/' + userId + '/posts', { headers: authHeader() })
            .then(response => {
                return response.data;
            });
    }
}

export default new ProfileService();
