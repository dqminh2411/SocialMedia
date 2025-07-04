
import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/';

class ProfileService {

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
    }
    getUserPosts(userId) {
        return axios.get(API_URL + 'profile/' + userId + '/posts', { headers: authHeader() })
            .then(response => {
                return response.data;
            });
    } checkFollowStatus(followingUserId, followedUserId) {
        return axios.get(
            API_URL + 'follows/check?followingUserId=' + followingUserId + '&followedUserId=' + followedUserId,
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        })
    }
    getUserFollowers(userId, query = '', page = 0, size = 10) {
        let url = API_URL + 'follows/followers/' + userId + '?page=' + page + '&size=' + size;
        if (query) {
            url += '&query=' + encodeURIComponent(query);
        }

        return axios.get(url, { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }


    getUserFollowing(userId, query = '', page = 0, size = 10) {
        let url = API_URL + 'follows/following/' + userId + '?page=' + page + '&size=' + size;
        if (query) {
            url += '&query=' + encodeURIComponent(query);
        }

        return axios.get(url, { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }
}

export default new ProfileService();
