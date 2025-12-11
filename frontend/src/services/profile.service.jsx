
import api from './api.js';
import authHeader from './auth-header';

class ProfileService {

    getUserProfile(userId) {
        return api.get('/profile/' + userId, { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }
    getUserProfileByUsername(username) {
        return api.get('/profile/un/' + username, { headers: authHeader() })
            .then(response => {
                return response.data.data;
            });
    }

    updateUserProfile(profileData) {
        return api.put(
            '/profile',
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
        return api.get(
            '/follows/check',
            {
                params: { followingUserId, followedUserId },
                headers: authHeader()
            }
        ).then(response => {
            return response.data.data;
        })
    }
    getUserFollowers(userId, query = '', page = 0, size = 10) {
        return api.get(
            '/follows/followers/' + userId,
            {
                params: { page, size, query },
                headers: authHeader()
            }
        ).then(response => {
            return response.data.data;
        });
    }


    getUserFollowing(userId, query = '', page = 0, size = 10) {
        return api.get(
            '/follows/following/' + userId,
            {
                params: { page, size, query },
                headers: authHeader()
            }
        ).then(response => {
            return response.data.data;
        });
    }
}

export default new ProfileService();
