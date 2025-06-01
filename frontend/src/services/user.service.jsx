import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/';
const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
const DEFAULT_AVATAR = 'default.png';

class UserService {
    // Get user profile by ID
    getUserProfile(userId) {
        return axios.get(
            API_URL + 'users/' + userId,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error("Error fetching user profile:", error);
                throw error;
            });
    }

    // Get current user profile
    getCurrentUserProfile() {
        return axios.get(
            API_URL + 'users/me',
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error("Error fetching current user profile:", error);
                throw error;
            });
    }

    // Update user profile
    updateUserProfile(userData) {
        return axios.put(
            API_URL + 'users/me',
            userData,
            { headers: authHeader() }
        )
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error("Error updating user profile:", error);
                throw error;
            });
    }

    // Upload user avatar
    uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        return axios.post(
            API_URL + 'users/avatar',
            formData,
            {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error("Error uploading avatar:", error);
                throw error;
            });
    }

    // Get user followers
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
    searchUsers(query, page = 0, size = 10) {
        return axios.get(
            API_URL + 'users/search',
            {
                params: { query, page, size },
                headers: authHeader()
            }
        )
            .then(response => {
                return response.data;
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