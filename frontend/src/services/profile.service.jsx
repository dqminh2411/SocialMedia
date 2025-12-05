
import axios from 'axios';
import authHeader from './auth-header';

const PROFILE_API_URL = 'http://localhost:8080/api/v1/profile';
const FOLLOW_API_URL = 'http://localhost:8080/api/v1/follows';
class ProfileService {

    getUserProfile(userId) {
        return axios.get(PROFILE_API_URL + "/" + userId, { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }
    getUserProfileByUsername(username) {
        return axios.get(PROFILE_API_URL + '/un/' + username, { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }

    updateUserProfile(profileData) {
        return axios.put(
            PROFILE_API_URL + "/update",
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
    checkFollowStatus(followingUserId, followedUserId) {
        return axios.get(
            FOLLOW_API_URL + '/check?followingUserId=' + followingUserId + '&followedUserId=' + followedUserId,
            { headers: authHeader() }
        ).then(response => {
            return response.data.data;
        })
    }
    getUserFollowers(userId, query = '', page = 0, size = 10) {
        let url = FOLLOW_API_URL + 'follows/followers/' + userId + '?page=' + page + '&size=' + size;
        if (query) {
            url += '&query=' + encodeURIComponent(query);
        }

        return axios.get(url, { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }


    getUserFollowing(userId, query = '', page = 0, size = 10) {
        let url = FOLLOW_API_URL + '/following/' + userId + '?page=' + page + '&size=' + size;
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
