import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/css/SearchPage.module.css';
import Sidebar from '../components/Sidebar';
import UserService from '../services/user.service.jsx';
import PostService from '../services/post.service.jsx';
const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    
    const [tags, setTags] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const responseUsers = await UserService.searchUsers(query);
            const responseTags = await PostService.searchHashtags(query);
            setUsers(responseUsers.users ? responseUsers.users : []);
            setTags(responseTags.hashtags ? responseTags.hashtags : []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);

            console.log(users)
            console.log(tags)
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.searchContainer}>
                    <form className={styles.searchBox} onSubmit={handleSearch} >
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" className={styles.searchButton}>Search</button>
                    </form>

                    {loading && <div className={styles.loadingIndicator}>Loading...</div>}

                    {(users.length > 0 || tags.length > 0) && (
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
                                            {users.length > 0 ? (
                                                users.map(user => (
                                                    <div key={user.id} className={styles.userItem}>
                                                        <div className={styles.userAvatar}>
                                                            <img src={UserService.getAvatarUrl(user.avatar)} alt={user.username} />
                                                        </div>
                                                        <Link to={`/profile/un/${user.username}`} className={styles.userLink}>
                                                            <div className={styles.userInfo}>
                                                                <div className={styles.userName}>{user.username}</div>
                                                                <div className={styles.userFullName}>{user.fullName}</div>
                                                            </div>
                                                        </Link>
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
                                            {tags.length > 0 ? (
                                                tags.map(tag => (
                                                    <div key={tag.id} className={styles.tagItem}>
                                                        <div className={styles.tagIcon}>#</div>
                                                        <Link to={`/hashtag/${tag.name}`} className={styles.tagLink}>
                                                            <div className={styles.tagInfo}>
                                                                <div className={styles.tagName}>#{tag.name}</div>
                                                                {}
                                                            </div>
                                                        </Link>

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
                    {users.length === 0 && tags.length === 0 && searched && !loading && (
                        <div className={styles.noResults}>
                            <h3>No Results Found</h3>
                            <p>Try searching for a different keyword</p>
                        </div>
                    )}
                    {!searched && (
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
