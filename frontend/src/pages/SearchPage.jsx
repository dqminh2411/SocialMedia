import React, { useState } from 'react';
import styles from '../assets/css/SearchPage.module.css';
import Sidebar from '../components/Sidebar';

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [hasSearched, setHasSearched] = useState(false);

    // Mock data for search results
    const mockUsers = [
        {
            id: 1,
            username: 'user1',
            fullName: 'NGuyen Anh',
            avatar: 'http://localhost:8080/storage/avatars/defaultAvatar.jpg'
        },
        {
            id: 2,
            username: 'user2',
            fullName: 'Tran B',
            avatar: 'http://localhost:8080/storage/avatars/defaultAvatar.jpg'
        },
        {
            id: 3,
            username: 'user3',
            fullName: 'Thanh Tung',
            avatar: 'http://localhost:8080/storage/avatars/defaultAvatar.jpg'
        }
    ];

    const mockTags = [
        {
            id: 1,
            name: 'photography',
            postsCount: '2.3M posts'
        },
        // {
        //     id: 2,
        //     name: 'travel',
        //     postsCount: '4.8M posts'
        // },
        // {
        //     id: 3,
        //     name: 'food',
        //     postsCount: '3.1M posts'
        // }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        setHasSearched(true);
        // In a real app, you would make API calls here
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.searchContainer}>
                    <form className={styles.searchBox} onSubmit={handleSearch}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className={styles.searchButton}>Search</button>
                    </form>

                    {hasSearched && (
                        <>
                            <div className={styles.searchTabs}>
                                <button
                                    className={`${styles.tabButton} ${activeTab === 'users' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('users')}
                                >
                                    Users
                                </button>
                                <button
                                    className={`${styles.tabButton} ${activeTab === 'tags' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('tags')}
                                >
                                    Tags
                                </button>
                            </div>

                            <div className={styles.searchResults}>
                                {activeTab === 'users' && (
                                    <>
                                        <h3 className={styles.resultsTitle}>Users</h3>
                                        <div className={styles.usersList}>
                                            {mockUsers.length > 0 ? (
                                                mockUsers.map(user => (
                                                    <div key={user.id} className={styles.userItem}>
                                                        <div className={styles.userAvatar}>
                                                            <img src={user.avatar} alt={user.username} />
                                                        </div>
                                                        <div className={styles.userInfo}>
                                                            <div className={styles.userName}>{user.username}</div>
                                                            <div className={styles.userFullName}>{user.fullName}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className={styles.noResults}>
                                                    <h3>No Users Found</h3>
                                                    <p>Try searching for a different username</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {activeTab === 'tags' && (
                                    <>
                                        <h3 className={styles.resultsTitle}>Tags</h3>
                                        <div className={styles.tagsList}>
                                            {mockTags.length > 0 ? (
                                                mockTags.map(tag => (
                                                    <div key={tag.id} className={styles.tagItem}>
                                                        <div className={styles.tagIcon}>#</div>
                                                        <div className={styles.tagInfo}>
                                                            <div className={styles.tagName}>#{tag.name}</div>
                                                            <div className={styles.tagCount}>{tag.postsCount}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className={styles.noResults}>
                                                    <h3>No Tags Found</h3>
                                                    <p>Try searching for a different tag</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {!hasSearched && (
                        <div className={styles.noResults}>
                            <h3>Search for Users or Tags</h3>
                            <p>Enter a search term to find users and hashtags</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
