// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import AdminService from '../../services/admin.service';
import AdminLayout from '../../components/admin/AdminLayout';
import styles from '../../assets/css/AdminUserManagement.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faTrash,
    faSearch,
    faChevronLeft,
    faChevronRight,
    faTimes,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        fullName: '',
        role: '',
        status: ''
    }); const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await AdminService.getMockUsers(page, size, searchQuery);

            if (response.data && response.data.data) {
                setUsers(response.data.data.content);
                setTotalPages(response.data.data.totalPages);
            } else {
                // Try to use the mock data directly
                const mockData = AdminService.getMockUsers(page, size, searchQuery);
                setUsers(mockData.data.content);
                setTotalPages(mockData.data.totalPages);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users. Using mock data instead.');

            // Use mock data as fallback
            const mockData = AdminService.getMockUsers(page, size, searchQuery);
            setUsers(mockData.data.content);
            setTotalPages(mockData.data.totalPages);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
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
        fetchUsers();
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditForm({
            username: user.username,
            email: user.email,
            fullName: user.fullName || '',
            role: user.role || 'USER',
            status: user.status || 'ACTIVE'
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await AdminService.deleteUser(userId);
                // Refresh the user list
                fetchUsers();
                alert('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user. Please try again.');
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
            await AdminService.updateUser(selectedUser.id, editForm);
            setShowEditModal(false);
            // Refresh the user list
            fetchUsers();
            alert('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user. Please try again.');
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

    return (
        <AdminLayout>
            <div className={styles.userManagementContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>User Management</h1>

                    <form className={styles.searchForm} onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search users..."
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
                        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
                        <p>Loading users...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorMessage}>{error}</p>
                        <button
                            className={styles.retryButton}
                            onClick={fetchUsers}
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableWrapper}>
                            <table className={styles.usersTable}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Full Name</th>
                                        <th>Role</th>

                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>{user.fullName || 'N/A'}</td>
                                                <td>
                                                    <span className={`${styles.badge} ${styles[user.role?.toLowerCase() || 'user']}`}>
                                                        {user.role || 'USER'}
                                                    </span>
                                                </td>

                                                <td>{formatDate(user.createdAt)}</td>
                                                <td className={styles.actions}>
                                                    <button
                                                        className={styles.editButton}
                                                        onClick={() => handleEditClick(user)}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        className={styles.deleteButton}
                                                        onClick={() => handleDeleteClick(user.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className={styles.noDataMessage}>
                                                No users found
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

            {/* Edit User Modal */}
            {showEditModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Edit User</h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowEditModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={styles.editForm} onSubmit={handleEditSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={editForm.username}
                                    onChange={handleEditFormChange}
                                    disabled // Username typically shouldn't be changed
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleEditFormChange}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={editForm.fullName}
                                    onChange={handleEditFormChange}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="role">Role</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={editForm.role}
                                    onChange={handleEditFormChange}
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="MODERATOR">Moderator</option>
                                </select>
                            </div>

                            {/* <div className={styles.formGroup}>
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={editForm.status}
                                    onChange={handleEditFormChange}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="SUSPENDED">Suspended</option>
                                    <option value="BANNED">Banned</option>
                                </select>
                            </div> */}

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

export default UserManagement;
