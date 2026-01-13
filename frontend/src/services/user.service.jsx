import api from './api.js';
import authHeader from './auth-header';

const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
const DEFAULT_AVATAR = 'default.png';

class UserService {


    getUserFollowers(userId, page = 0, size = 20) {
        return api.get(
            '/users/' + userId + '/followers',
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


    getUserFollowing(userId, page = 0, size = 20) {
        return api.get(
            '/users/' + userId + '/following',
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


    followUser(userId) {
        return api.post(
            '/users/' + userId + '/follow',
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


    unfollowUser(userId) {
        return api.delete(
            '/users/' + userId + '/follow',
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


    searchUsers(username, page = 1) {
        return api.get(
            '/users',
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
        return api.get(
            '/users/suggestions',
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

                return { content: [] };
            });
    }


    
}

export default new UserService();
