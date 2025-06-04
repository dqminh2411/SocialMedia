import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import styles from '../assets/css/ProfilePage.module.css';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import ProfileService from '../services/profile.service';
import UserService from '../services/user.service.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faSearch, faTimes, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import NotificationService from '../services/notification.service.jsx';

const ProfilePage = () => {
    const POST_MEDIA_URL = 'http://localhost:8080/storage/posts/';
    const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
    const { username } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState({
        id: 0,
        username: '',
        fullName: '',
        bio: '',
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        profilePic: '../assets/images/daidien.png'
    });
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState({
        userId: 0,
        bio: '',
        avatar: null
    }); const [previewAvatar, setPreviewAvatar] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false); const [avatarLoading, setAvatarLoading] = useState(false);
    const [followStatus, setFollowStatus] = useState('NOT_REQUESTED');
    const fileInputRef = useRef(null);

    // States for followers/following modal
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'followers' or 'following'
    const [followUsers, setFollowUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [followLoading, setFollowLoading] = useState(false);

    // Add pagination state variables
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [searched, setSearched] = useState(false);

    useEffect(() => {
        // Check if we're returning from a post deletion
        if (location.state && location.state.postDeleted) {
            console.log("Post was deleted, refreshing profile...");
            fetchUserProfile();
            // Clean up the location state to prevent multiple refreshes
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    useEffect(() => {
        // Log when the component is re-rendering due to location change
        if (location.key) {
            console.log("ProfilePage re-rendering due to navigation with key:", location.key);
        }

        // Fetch user profile when component mounts
        if (currentUser && currentUser.user && currentUser.user.id) {
            fetchUserProfile();

        }
    }, [currentUser, username, location.key]);

    const handleFollowClick = async () => {
        if (!currentUser) return;
        try {
            await NotificationService.sendFollowRequest(user.id, currentUser.user.id);
            setFollowStatus('PENDING');
            alert("Follow request sent");
        } catch (error) {
            console.error("Error sending follow request:", error);
        }
    };

    const handleOpenFollowModal = async (type) => {
        setModalType(type);
        setSearchQuery('');
        setFollowLoading(true);
        setShowFollowModal(true);
        setCurrentPage(0); // Reset to first page when opening modal

        try {
            let response;
            if (type === 'followers') {
                response = await ProfileService.getUserFollowers(user.id);
            } else if (type === 'following') {
                response = await ProfileService.getUserFollowing(user.id);
            }
            setFollowUsers(response.users || []);
            setTotalPages(response.totalPages || 0);
            setCurrentPage(response.currentPage || 0);
            setTotalItems(response.totalItems || 0);
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
        } finally {
            setFollowLoading(false);
        }
    };

    // Handle searching in the followers/following modal
    const handleFollowSearch = async () => {
        setFollowLoading(true);
        setCurrentPage(0); // Reset to first page when searching
        setSearched(true);
        try {
            let response;
            if (modalType === 'followers') {
                response = await ProfileService.getUserFollowers(user.id, searchQuery, 0, pageSize);
            } else if (modalType === 'following') {
                response = await ProfileService.getUserFollowing(user.id, searchQuery, 0, pageSize);
            }
            setFollowUsers(response.users || []);
            setTotalPages(response.totalPages || 0);
            setCurrentPage(response.currentPage || 0);
            setTotalItems(response.totalItems || 0);
        } catch (error) {
            console.error(`Error searching ${modalType}:`, error);
        } finally {
            setFollowLoading(false);
        }
    };

    // Handle page change in pagination
    const handlePageChange = async (newPage) => {
        if (newPage < 0 || newPage >= totalPages) return;

        setFollowLoading(true);
        setCurrentPage(newPage);

        try {
            let response;
            if (modalType === 'followers') {
                response = await ProfileService.getUserFollowers(user.id, searchQuery, newPage, pageSize);
            } else if (modalType === 'following') {
                response = await ProfileService.getUserFollowing(user.id, searchQuery, newPage, pageSize);
            }
            setFollowUsers(response.users || []);
            setTotalPages(response.totalPages || 0);
            setCurrentPage(response.currentPage || 0);
            setTotalItems(response.totalItems || 0);
        } catch (error) {
            console.error(`Error changing page:`, error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleCloseFollowModal = () => {
        setShowFollowModal(false);
        setModalType('');
        setFollowUsers([]);
        setSearchQuery('');
        setCurrentPage(0);
        setTotalPages(0);
        setTotalItems(0);
    };

    const fetchUserProfile = async () => {
        // if (!currentUser || !currentUser.user.id) {
        //     setError('User not logged in or user ID not available');
        //     setLoading(false);
        //     return;
        // }
        const profileUsername = username || currentUser.user.username;
        if (!profileUsername) {
            setError('Username not provided');
            setLoading(false);
            return;
        }
        try {
            const profileData = await ProfileService.getUserProfileByUsername(profileUsername);
            const follow = await ProfileService.checkFollowStatus(currentUser.user.id, profileData.userDTO.id);
            setFollowStatus(follow.followStatus);
            console.log('Profile data received:', profileData);

            setUser({
                id: profileData.userDTO.id || 0,
                username: profileData.userDTO.username || 'User',
                fullName: profileData.userDTO.fullname || '',
                bio: profileData.bio || '',
                postsCount: profileData.totalPostCount || 0,
                followersCount: profileData.totalFollowerCount || 0,
                followingCount: profileData.totalFollowingCount || 0,
                avatar: UserService.getAvatarUrl(profileData.userDTO.avatar)
            });

            // Fetch user posts
            // const postsData = await ProfileService.getUserPosts(userId);
            // setPosts(postsData);
            setPosts(profileData.posts || []);
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to load profile. Please try again later.');


        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleEditProfileClick = () => {
        // Initialize form with current values
        setEditFormData({
            bio: user.bio || '',
            avatar: null
        });
        setPreviewAvatar(user.avatar);
        setShowEditForm(true);
        setUpdateError(null);
        setUpdateSuccess(false);
    }; const handleCloseEditForm = () => {
        // Check if there are unsaved changes
        const hasUnsavedChanges =
            editFormData.bio !== (user.bio || '') ||
            editFormData.avatar !== null;

        if (hasUnsavedChanges) {
            // Ask for confirmation before closing
            // const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
            // if (!confirmClose) {
            //     return; // User chose to continue editing
            // }
        }

        // Close the form and reset form state
        setShowEditForm(false);
        setPreviewAvatar(null);
        setEditFormData({
            bio: '',
            avatar: null
        });
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditFormData(prev => ({
                ...prev,
                avatar: file
            }));

            // Show loading indicator
            setAvatarLoading(true);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result);
                setAvatarLoading(false);
            };
            reader.onerror = () => {
                setUpdateError('Failed to load image preview');
                setAvatarLoading(false);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    // Validate profile data before submission
    const validateProfileData = (data) => {
        const errors = {};

        // Validate bio (optional, but if provided should be within limits)
        if (data.bio && data.bio.length > 500) {
            errors.bio = 'Bio must be 500 characters or less';
        }

        // Validate avatar if present
        if (data.avatar) {
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(data.avatar.type)) {
                errors.avatar = 'Only JPG, PNG, GIF, and WEBP images are allowed';
            }

            // Check file size (2MB limit)
            const maxSize = 2 * 1024 * 1024; // 2MB in bytes
            if (data.avatar.size > maxSize) {
                errors.avatar = 'Image size should be less than 2MB';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };// Function to submit profile updates to the backend
    const submitProfileUpdate = async (profileData) => {
        if (!currentUser || !currentUser.user.id) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const formData = new FormData();
            // Add user ID to formData
            formData.append('userId', currentUser.user.id);
            // Add bio to formData
            formData.append('bio', profileData.bio);

            // Add avatar to formData if it exists
            if (profileData.avatar) {
                formData.append('avatar', profileData.avatar);
            }

            // Make API call to update profile
            const response = await ProfileService.updateUserProfile(formData);
            console.log('Profile updated:', response);

            return {
                success: true,
                data: response
            };
        } catch (err) {
            console.error('Error updating profile:', err);
            return {
                success: false,
                error: err.response?.data?.message || 'Failed to update profile. Please try again.'
            };
        }
    };
    // Form submission handler
    const handleSubmitEditForm = async (e) => {
        e.preventDefault();

        setUpdateLoading(true);
        setUpdateError(null);
        setUpdateSuccess(false);

        // Validate form data before submission
        const validationResult = validateProfileData(editFormData);
        if (!validationResult.isValid) {
            // Get the first error message
            const firstError = Object.values(validationResult.errors)[0];
            setUpdateError(firstError);
            setUpdateLoading(false);
            return;
        }

        const result = await submitProfileUpdate(editFormData);

        if (result.success) {
            // Update the user state with new data
            setUser(prev => ({
                ...prev,
                bio: editFormData.bio,
                // Only update avatar if a new one was uploaded
                ...(editFormData.avatar && { avatar: previewAvatar })
            }));

            setUpdateSuccess(true);

            // Close the form after a delay
            setTimeout(() => {
                handleCloseEditForm();
                // Refresh the profile data
                fetchUserProfile();
            }, 1500);
        } else {
            setUpdateError(result.error);
        }

        setUpdateLoading(false);
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <p>Loading profile...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.profileHeader}>
                            <div className={styles.profilePicture}>
                                <img src={user.avatar} alt={user.username} />
                            </div>
                            <div className={styles.profileInfo}>
                                <h1>{user.username}</h1>                                <div className={styles.stats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statNumber}>{user.postsCount}</span> posts
                                    </div>
                                    <div
                                        className={`${styles.stat} ${styles.clickable}`}
                                        onClick={() => handleOpenFollowModal('followers')}
                                    >
                                        <span className={styles.statNumber}>{user.followersCount}</span> followers
                                    </div>
                                    <div
                                        className={`${styles.stat} ${styles.clickable}`}
                                        onClick={() => handleOpenFollowModal('following')}
                                    >
                                        <span className={styles.statNumber}>{user.followingCount}</span> following
                                    </div>
                                </div>
                                <div className={styles.bio}>
                                    <p className={styles.fullName}>{user.fullName}</p>
                                    <p>{user.bio}</p>
                                </div>

                                {/* Only show Edit button if this is the current user's profile */}
                                {currentUser && currentUser.user.username === username ? (
                                    <button
                                        className={styles.editProfileBtn}
                                        onClick={handleEditProfileClick}
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    // Show Follow/Message button for other users
                                    <div className={styles.profileActions}>
                                        <button
                                            className={styles.followBtn}
                                            onClick={followStatus === 'NOT_REQUESTED' ? handleFollowClick : undefined}
                                        >
                                            {followStatus === 'NOT_REQUESTED' ? 'Follow' : followStatus === 'PENDING' ? 'Requested' : 'Followed'}
                                        </button>
                                        {/* <button 
                                            className={styles.messageBtn}
                                            onClick={() => handleMessageUser(user.userId)}
                                        >
                                            Message
                                        </button> */}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.profileTabs}>
                            <button
                                className={`${styles.tabButton} ${activeTab === 'posts' ? styles.active : ''}`}
                                onClick={() => handleTabChange('posts')}
                            >
                                Posts
                            </button>
                            <button
                                className={`${styles.tabButton} ${activeTab === 'saved' ? styles.active : ''}`}
                                onClick={() => handleTabChange('saved')}
                            >
                                Saved
                            </button>
                            <button
                                className={`${styles.tabButton} ${activeTab === 'tagged' ? styles.active : ''}`}
                                onClick={() => handleTabChange('tagged')}
                            >
                                Tagged
                            </button>
                        </div>

                        {activeTab === 'posts' && (
                            <div className={styles.postsGrid}>
                                {posts && posts.length > 0 ? (
                                    posts.map(post => (
                                        <div
                                            key={post.id}
                                            className={styles.postItem}
                                            onClick={() => navigate(`/post/${post.id}`, {
                                                state: { background: location }
                                            })}
                                        >                                            <img src={POST_MEDIA_URL + post.firstMediaName} alt="Post" />
                                            <div className={styles.postOverlay}>
                                                <div className={styles.postStats}>
                                                    <span>
                                                        <FontAwesomeIcon icon={faHeart} className={styles.statIcon} /> {post.likes}
                                                    </span>
                                                    <span>
                                                        <FontAwesomeIcon icon={faComment} className={styles.statIcon} /> {post.comments}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noPosts}>No posts yet</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'saved' && (
                            <div className={styles.savedPostsMessage}>
                                <p>Only you can see what you've saved</p>
                            </div>
                        )}

                        {activeTab === 'tagged' && (
                            <div className={styles.taggedPostsMessage}>
                                <p>Photos of you</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Profile Modal */}
            {showEditForm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Edit Profile</h2>
                            <button className={styles.closeButton} onClick={handleCloseEditForm}>×</button>
                        </div>

                        <form onSubmit={handleSubmitEditForm}>
                            <div className={styles.formGroup}>
                                <label>Profile Picture</label>
                                <div className={styles.avatarUpload}
                                    onClick={handleAvatarClick}
                                >
                                    {avatarLoading ? (
                                        <div className={styles.avatarLoading}>
                                            <span>Loading...</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={previewAvatar}
                                            alt="Profile"
                                            className={styles.avatarPreview}
                                        />
                                    )}
                                    <div className={styles.avatarOverlay}>
                                        <span>Change Photo</span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>                            <div className={styles.formGroup}>
                                <label htmlFor="bio">Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={editFormData.bio}
                                    onChange={handleEditFormChange}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    maxLength={500}
                                    className={styles.bioInput}
                                />
                                <div className={styles.charCounter}>
                                    {editFormData.bio.length}/500 characters
                                </div>
                            </div>

                            {updateError && (
                                <div className={styles.errorMessage}>
                                    {updateError}
                                </div>
                            )}

                            {updateSuccess && (
                                <div className={styles.successMessage}>
                                    Profile updated successfully!
                                </div>
                            )}

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={handleCloseEditForm}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={updateLoading}
                                >
                                    {updateLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>                    </div>
                </div>
            )}

            {/* Followers/Following Modal */}
            {showFollowModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>{modalType === 'followers' ? 'Followers' : 'Following'}</h2>
                            <button className={styles.closeButton} onClick={handleCloseFollowModal}>×</button>
                        </div>

                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder={`Search ${modalType}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                            <button
                                className={styles.searchButton}
                                onClick={handleFollowSearch}
                                disabled={followLoading}
                            >
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>

                        <div className={styles.followList}>
                            {followLoading ? (
                                <div className={styles.loadingSpinner}>Loading...</div>
                            ) : followUsers.length > 0 ? (
                                followUsers.map(user => (
                                    <Link
                                        key={user.id}
                                        to={`/profile/un/${user.username}`}
                                        className={styles.followItem}
                                        onClick={handleCloseFollowModal}
                                    >
                                        <div className={styles.followAvatar}>
                                            <img
                                                src={UserService.getAvatarUrl(user.avatar)}
                                                alt={user.username}
                                            />
                                        </div>
                                        <div className={styles.followInfo}>
                                            <span className={styles.followUsername}>{user.username}</span>
                                            <span className={styles.followName}>{user.fullname}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className={styles.noResults}>
                                    {searched ? "No results" : modalType === 'followers' ? 'No followers found' : 'Not following anyone'}
                                </div>
                            )}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 0 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0 || followLoading}
                                >
                                    Previous
                                </button>
                                <span className={styles.pageInfo}>
                                    Page {currentPage + 1} of {totalPages}
                                </span>
                                <button
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage + 1 === totalPages || followLoading}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
