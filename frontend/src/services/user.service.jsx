import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/';
const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
const DEFAULT_AVATAR = 'default.png';

class UserService {


    getUserFollowers(userId, page = 0, size = 20) {
        return axios.get(
            API_URL + 'users/' + userId + '/followers',
            {
                params: { page, size },
                headers: authHeader()
            }
        )
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error("Error fetching user followers:", error);
                throw error;
            });
    }

    // Get users that the user is following
    getUserFollowing(userId, page = 0, size = 20) {
        return axios.get(
            API_URL + 'users/' + userId + '/following',
            {
                params: { page, size },
                headers: authHeader()
            }
        )
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error("Error fetching user following:", error);
                throw error;
            });
    }

    // Follow a user
    followUser(userId) {
        return axios.post(
            API_URL + 'users/' + userId + '/follow',
            {},
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error("Error following user:", error);
                throw error;
            });
    }

    // Unfollow a user
    unfollowUser(userId) {
        return axios.delete(
            API_URL + 'users/' + userId + '/follow',
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error("Error unfollowing user:", error);
                throw error;
            });
    }

    // Search for users
    searchUsers(username, page = 1) {
        return axios.get(
            'http://localhost:8080/users/search',
            {
                params: { username, page },
                headers: authHeader()
            }
        )
            .then(response => {
                return response.data.data;
            })
            .catch(error => {
                console.error("Error searching users:", error);
                throw error;
            });
    }

    // Get suggested users to follow
    getSuggestedUsers(userId, pageNo = 0) {
        return axios.get(
            'http://localhost:8080/users/suggestions',
            {
                params: { userId, pageNo },
                headers: authHeader()
            }
        )
            .then(response => {
                return response.data.data;
            })
            .catch(error => {
                console.error("Error fetching suggested users:", error);
                // Return empty array as fallback
                return { content: [] };
            });
    }

    // Helper method to get avatar URL
    getAvatarUrl(avatarFileName) {
        if (!avatarFileName) {
            return AVATAR_URL + DEFAULT_AVATAR;
        }
        return AVATAR_URL + avatarFileName;
    }
}

export default new UserService();