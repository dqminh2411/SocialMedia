// src/pages/admin/PostManagement.jsx
import React, { useState, useEffect } from 'react';
import AdminService from '../../services/admin.service';
import AdminLayout from '../../components/admin/AdminLayout';
import styles from '../../assets/css/AdminPostManagement.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faEye,
    faEdit,
    faTrash,
    faChevronLeft,
    faChevronRight,
    faTimes,
    faImage
} from '@fortawesome/free-solid-svg-icons';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        caption: '',
        status: ''
    }); const fetchPosts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await AdminService.getMockPosts(page, size, searchQuery);

            if (response.data && response.data.data) {
                setPosts(response.data.data.content);
                setTotalPages(response.data.data.totalPages);
            } else {
                // Try to use the mock data directly
                const mockData = AdminService.getMockPosts(page, size, searchQuery);
                setPosts(mockData.data.content);
                setTotalPages(mockData.data.totalPages);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to load posts. Using mock data instead.');

            // Use mock data as fallback
            const mockData = AdminService.getMockPosts(page, size, searchQuery);
            setPosts(mockData.data.content);
            setTotalPages(mockData.data.totalPages);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page, size, searchQuery]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0); // Reset to first page when searching
        fetchPosts();
    };

    const handleViewClick = async (postId) => {
        try {
            const response = await AdminService.getPostById(postId);
            setSelectedPost(response.data.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error fetching post details:', error);
            alert('Failed to load post details. Please try again.');
        }
    };

    const handleEditClick = async (postId) => {
        try {
            const response = await AdminService.getPostById(postId);
            const post = response.data.data;
            setSelectedPost(post);
            setEditForm({
                caption: post.caption || '',
                status: post.status || 'ACTIVE'
            });
            setShowEditModal(true);
        } catch (error) {
            console.error('Error fetching post for edit:', error);
            alert('Failed to load post. Please try again.');
        }
    };

    const handleDeleteClick = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await AdminService.deletePost(postId);
                // Refresh the post list
                fetchPosts();
                alert('Post deleted successfully');
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post. Please try again.');
            }
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm({
            ...editForm,
            [name]: value
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        try {
            await AdminService.updatePost(selectedPost.id, editForm);
            setShowEditModal(false);
            // Refresh the post list
            fetchPosts();
            alert('Post updated successfully');
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <AdminLayout>
            <div className={styles.postManagementContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Post Management</h1>

                    <form className={styles.searchForm} onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchButton}>
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Loading posts...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorMessage}>{error}</p>
                        <button
                            className={styles.retryButton}
                            onClick={fetchPosts}
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableWrapper}>
                            <table className={styles.postsTable}>
                                <thead>
                                    <tr>
                                        <th>ID</th>

                                        <th>Content</th>
                                        <th>Author</th>
                                        <th>Likes</th>
                                        <th>Comments</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.length > 0 ? (
                                        posts.map(post => (
                                            <tr key={post.id}>
                                                <td>{post.id}</td>
                                                <td>
                                                    {post.mediaUrl ? (
                                                        <div className={styles.thumbnailContainer}>
                                                            <img
                                                                src={post.mediaUrl}
                                                                alt="Post thumbnail"
                                                                className={styles.thumbnail}
                                                            />
                                                        </div>
                                                    ) : (
                                                        'No image'
                                                    )}
                                                </td>
                                                <td>{truncateText(post.caption)}</td>
                                                <td>{post.author?.username || 'User1'}</td>
                                                <td>{post.likeCount || 0}</td>
                                                <td>{post.commentCount || 0}</td>

                                                <td>{formatDate(post.createdAt)}</td>
                                                <td className={styles.actions}>
                                                    <button
                                                        className={styles.viewButton}
                                                        onClick={() => handleViewClick(post.id)}
                                                        title="View Post"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                    {/* <button
                                                        className={styles.editButton}
                                                        onClick={() => handleEditClick(post.id)}
                                                        title="Edit Post"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button> */}
                                                    <button
                                                        className={styles.deleteButton}
                                                        onClick={() => handleDeleteClick(post.id)}
                                                        title="Delete Post"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className={styles.noDataMessage}>
                                                No posts found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.pagination}>
                            <button
                                className={styles.pageButton}
                                disabled={page === 0}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>

                            <span className={styles.pageInfo}>
                                Page {page + 1} of {totalPages}
                            </span>

                            <button
                                className={styles.pageButton}
                                disabled={page >= totalPages - 1}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Post Detail Modal */}
            {showDetailModal && selectedPost && (
                <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div className={styles.detailModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Post Details</h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowDetailModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className={styles.postDetail}>
                            <div className={styles.postImage}>
                                {selectedPost.mediaUrl ? (
                                    <img
                                        src={selectedPost.mediaUrl}
                                        alt="Post"
                                        className={styles.fullImage}
                                    />
                                ) : (
                                    <div className={styles.noImage}>
                                        <FontAwesomeIcon icon={faImage} />
                                        <p>No image available</p>
                                    </div>
                                )}
                            </div>

                            <div className={styles.postInfo}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Author:</span>
                                    <span className={styles.infoValue}>{selectedPost.author?.username || 'Unknown'}</span>
                                </div>

                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Caption:</span>
                                    <p className={styles.caption}>{selectedPost.caption || 'No caption'}</p>
                                </div>

                                <div className={styles.infoRow}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Likes:</span>
                                        <span className={styles.infoValue}>{selectedPost.likeCount || 0}</span>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Comments:</span>
                                        <span className={styles.infoValue}>{selectedPost.commentCount || 0}</span>
                                    </div>
                                </div>

                                <div className={styles.infoRow}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Status:</span>
                                        <span className={`${styles.badge} ${styles[selectedPost.status?.toLowerCase() || 'active']}`}>
                                            {selectedPost.status || 'ACTIVE'}
                                        </span>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Created:</span>
                                        <span className={styles.infoValue}>{formatDate(selectedPost.createdAt)}</span>
                                    </div>
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleEditClick(selectedPost.id);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faEdit} /> Edit Post
                                    </button>

                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleDeleteClick(selectedPost.id);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} /> Delete Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Post Modal */}
            {showEditModal && selectedPost && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Edit Post</h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowEditModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={styles.editForm} onSubmit={handleEditSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="caption">Caption</label>
                                <textarea
                                    id="caption"
                                    name="caption"
                                    value={editForm.caption}
                                    onChange={handleEditFormChange}
                                    rows="4"
                                ></textarea>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={editForm.status}
                                    onChange={handleEditFormChange}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="HIDDEN">Hidden</option>
                                    <option value="REPORTED">Reported</option>
                                    <option value="REMOVED">Removed</option>
                                </select>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveButton}>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default PostManagement;
