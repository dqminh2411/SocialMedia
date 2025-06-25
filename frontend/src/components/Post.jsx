import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from '../assets/css/Post.module.css';


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
    useEffect(() => {
        setLikeCount(likes);
        setIsLikedByUser(isLiked);
    }, [likes, isLiked]);

    const handlePostClick = () => {


        navigate(`/post/${id}`, {
            state: { background: location }
        });
    };

    const handleViewAllComments = (e) => {
        e.stopPropagation();
        navigate(`/post/${id}`, {
            state: { background: location }
        });
    };

    const goToNextMedia = (e) => {
        e.stopPropagation();
        if (currentMediaIndex < mediaItems.length - 1) {
            setCurrentMediaIndex(prevIndex => prevIndex + 1);
        }
    };

    const goToPrevMedia = (e) => {
        e.stopPropagation();
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex(prevIndex => prevIndex - 1);
        }
    }; const isVideo = (url) => {
        if (!url) return false;
        return url.toLowerCase().endsWith('.mp4') ||
            url.toLowerCase().endsWith('.mov') ||
            url.toLowerCase().endsWith('.webm');
    };

    const handleLikePost = async () => {
        try {
            const newIsLikedByUser = !isLikedByUser
            setIsLikedByUser(newIsLikedByUser);
            setLikeCount(prevCount => newIsLikedByUser ? prevCount + 1 : prevCount - 1);
            await PostService.likePost(id);

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
            </div>            <div className={styles.mediaContainer}>
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

            <p>{likeCount} likes</p>

            {content.length > 30 ?
                <>
                    <div dangerouslySetInnerHTML={{ __html: content.substring(0, 30) }} className={styles.comment} />
                    <span className={styles.comment} onClick={handlePostClick}>... more</span>
                </> :
                <div dangerouslySetInnerHTML={{ __html: content }} className={styles.comment} />
            }

            <p className={styles.comment} onClick={handleViewAllComments}>View all {commentsCount} comments</p>
            <p className={styles.comment} onClick={handlePostClick}>Add a comment...</p>
        </div>
    );
};

export default Post;
