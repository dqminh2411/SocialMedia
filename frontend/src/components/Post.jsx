import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from '../assets/css/Post.module.css';

// Import icons
import likeIcon from '../assets/images/traitim2.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import commentIcon from '../assets/images/binhluan2.png';
import PostService from '../services/post.service.jsx';
const Post = ({ id, username, userAvatar, media, likes, content, createdAt, commentsCount, isLiked }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);


    const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
    const DEFAULT_AVATAR = 'defaultAvatar.jpg';
    const POST_MEDIA_URL = 'http://localhost:8080/storage/posts/';
    // Ensure media is always an array
    const mediaItems = Array.isArray(media) ? media : [media];

    const [isLikedByUser, setIsLikedByUser] = useState(isLiked || false);
    const [likeCount, setLikeCount] = useState(likes || 0);

    const handlePostClick = () => {
        // Navigate to the post detail with the current location as state
        // This is what enables the modal behavior
        navigate(`/post/${id}`, {
            state: { background: location }
        });
    };

    const handleViewAllComments = (e) => {
        e.stopPropagation(); // Prevent the click from bubbling up to the post div
        navigate(`/post/${id}`, {
            state: { background: location }
        });
    };

    const goToNextMedia = (e) => {
        e.stopPropagation(); // Prevent the click from bubbling up to the post div
        if (currentMediaIndex < mediaItems.length - 1) {
            setCurrentMediaIndex(prevIndex => prevIndex + 1);
        }
    };

    const goToPrevMedia = (e) => {
        e.stopPropagation(); // Prevent the click from bubbling up to the post div
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex(prevIndex => prevIndex - 1);
        }
    }; const isVideo = (url) => {
        if (!url) return false;
        return url.toLowerCase().endsWith('.mp4') ||
            url.toLowerCase().endsWith('.mov') ||
            url.toLowerCase().endsWith('.webm');
    };

    // Add touch swipe functionality for mobile users
    const handleTouchStart = React.useRef(null);
    const handleTouchEnd = React.useRef(null);

    useEffect(() => {
        handleTouchStart.current = (e) => {
            const touchStartX = e.touches[0].clientX;
            handleTouchEnd.current = (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;

                // If the swipe is significant enough (more than 50px)
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        // Swipe left -> next image
                        if (currentMediaIndex < mediaItems.length - 1) {
                            setCurrentMediaIndex(prevIndex => prevIndex + 1);
                        }
                    } else {
                        // Swipe right -> previous image
                        if (currentMediaIndex > 0) {
                            setCurrentMediaIndex(prevIndex => prevIndex - 1);
                        }
                    }
                }
            };
        };
    }, [currentMediaIndex, mediaItems.length]);

    const handleLikePost = async () => {
        try {
            await PostService.likePost(id);

            // Optimistically update UI
            setIsLikedByUser(!isLikedByUser);
            setLikeCount(prevCount => isLikedByUser ? prevCount - 1 : prevCount + 1);

            // Update post data
            if (postData) {
                setPostData({
                    ...postData,
                    likes: isLiked ? postData.likes - 1 : postData.likes + 1,
                    likedByCurrentUser: !isLiked
                });
            }
        } catch (error) {
            console.error("Error liking post:", error);

        }
    };
    return (
        <div className={styles.post}>
            <div className={styles.postUser}>
                <img src={userAvatar ? `${AVATAR_URL}${userAvatar}` : `${AVATAR_URL}${DEFAULT_AVATAR}`} alt={username} className={styles.avatar} />
                <Link to={`/profile/un/${username}`} className={styles.userLink}>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{username}</div>
                    </div>
                </Link>
            </div>
            <div className={styles.mediaContainer}
                onTouchStart={(e) => handleTouchStart.current(e)}
                onTouchEnd={(e) => handleTouchEnd.current(e)}
            >
                {mediaItems.length > 1 && currentMediaIndex > 0 && (
                    <button
                        className={`${styles.mediaNavButton} ${styles.prevButton}`}
                        onClick={goToPrevMedia}
                    >
                        &lt;
                    </button>
                )}

                {isVideo(mediaItems[currentMediaIndex].fileName) ? (
                    <video
                        src={POST_MEDIA_URL + mediaItems[currentMediaIndex].fileName}
                        className={styles.media}
                        controls
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <img
                        src={POST_MEDIA_URL + mediaItems[currentMediaIndex].fileName}
                        alt={`Post content ${currentMediaIndex + 1}`}
                        className={styles.media}
                    />
                )}

                {mediaItems.length > 1 && currentMediaIndex < mediaItems.length - 1 && (
                    <button
                        className={`${styles.mediaNavButton} ${styles.nextButton}`}
                        onClick={goToNextMedia}
                    >
                        &gt;
                    </button>
                )}

                {mediaItems.length > 1 && (
                    <div className={styles.mediaDots}>
                        {mediaItems.map((_, index) => (
                            <span
                                key={index}
                                className={`${styles.mediaDot} ${index === currentMediaIndex ? styles.activeDot : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.icon}>
                <div className={styles.leftIcon}>
                    <span>
                        <button
                            className={styles["like-button"]}
                            onClick={handleLikePost}
                            aria-label={isLikedByUser ? "Unlike this post" : "Like this post"}
                        >
                            <FontAwesomeIcon
                                icon={isLikedByUser ? solidHeart : regularHeart}
                                className={isLikedByUser ? styles["liked"] : styles["not-liked"]}
                            />
                        </button>
                    </span>
                    <span><img src={commentIcon} alt="Comment" onClick={handlePostClick} /></span>

                </div>

            </div>

            <p>{likes} likes</p>
            <p>
                {content.length > 30 ?
                    <>
                        <div dangerouslySetInnerHTML={{ __html: content.substring(0, 30) }} className={styles.comment} />
                        <span className={styles.comment} onClick={handlePostClick}>... more</span>
                    </> :
                    <div dangerouslySetInnerHTML={{ __html: content }} className={styles.comment} />
                }
            </p>
            <p className={styles.comment} onClick={handleViewAllComments}>View all {commentsCount} comments</p>
            <p className={styles.comment} onClick={handlePostClick}>Add a comment...</p>
        </div>
    );
};

export default Post;
