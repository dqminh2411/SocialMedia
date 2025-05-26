import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "../assets/css/PostDetail.module.css";
import additionalStyles from "../assets/css/PostDetailAdditions.module.css";
import PostService from "../services/post.service";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faChevronLeft, faChevronRight, faCircle } from '@fortawesome/free-solid-svg-icons';

const PostDetailPage = () => {
    const POST_MEDIA_URL = 'http://localhost:8080/storage/posts/';
    const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
    const { postId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const background = location.state?.background; const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [postData, setPostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    // Fetch post details from API
    useEffect(() => {
        setLoading(true);
        PostService.getPostDetails(postId)
            .then(data => {
                console.log("Post details fetched:", data);
                setPostData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching post details:", err);
                setError("Failed to load post details. Please try again later.");
                setLoading(false);
            });
    }, [postId]);
    // Close the popup when clicking outside the post card
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains(styles["modal-overlay"])) {
            // Navigate back to the previous page if we came via a modal
            if (background) {
                navigate(-1);
            }
        }
    };

    // Close the popup when pressing the escape key
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === "Escape" && background) {
                navigate(-1);
            }
        };

        window.addEventListener("keydown", handleEscKey);

        // Prevent scrolling of the background when modal is open
        if (background) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            window.removeEventListener("keydown", handleEscKey);
            document.body.style.overflow = "auto";
        };
    }, [navigate, background]);    // Format date to relative time (e.g., "2 hours ago")
    // const formatTime = (dateString) => {
    //     if (!dateString) return '';
    //     try {
    //         const date = new Date(dateString);
    //         return formatDistanceToNow(date, { addSuffix: true });
    //     } catch (error) {
    //         console.error("Error formatting date:", error);
    //         return dateString;
    //     }
    // }; 

    // Navigation functions for the media slider
    const goToNextMedia = () => {
        if (postData?.media && postData.media.length > 0) {
            setIsImageLoaded(false);
            setCurrentMediaIndex((prevIndex) =>
                prevIndex === postData.media.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    const goToPrevMedia = () => {
        if (postData?.media && postData.media.length > 0) {
            setIsImageLoaded(false);
            setCurrentMediaIndex((prevIndex) =>
                prevIndex === 0 ? postData.media.length - 1 : prevIndex - 1
            );
        }
    };

    return (
        <div
            className={background ? styles["modal-overlay"] : styles["page-container"]}
            onClick={background ? handleOverlayClick : undefined}
        >
            {loading ? (
                <div className={additionalStyles["loading-container"]}>
                    <div className={styles["loading-spinner"]}></div>
                    <p>Loading post details...</p>
                </div>
            ) : error ? (
                <div className={additionalStyles["error-container"]}>
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)}>Go Back</button>
                </div>
            ) : postData && (
                <div className={styles["post-container"]}>
                    <div className={styles["post-card"]}>
                        {/* Close button - only show in modal view */}
                        {background && (
                            <button className={styles["close-button"]} onClick={() => navigate(-1)}>×</button>
                        )}                        {/* Left side - Image or media */}
                        <div className={styles["post-image"]}>
                            <div className={`${styles["image-container"]} ${isImageLoaded ? styles["loaded"] : styles["loading"]}`}>
                                {postData.media && postData.media.length > 0 ? (
                                    <>
                                        {/* Show navigation arrows only if there are multiple media items */}
                                        {postData.media.length > 1 && (
                                            <>
                                                <button
                                                    className={additionalStyles["media-nav-button"]}
                                                    onClick={goToPrevMedia}
                                                    aria-label="Previous media"
                                                >
                                                    <FontAwesomeIcon icon={faChevronLeft} />
                                                </button>
                                                <button
                                                    className={additionalStyles["media-nav-button"]}
                                                    onClick={goToNextMedia}
                                                    aria-label="Next media"
                                                >
                                                    <FontAwesomeIcon icon={faChevronRight} />
                                                </button>
                                            </>
                                        )}

                                        {/* Display current media - image or video */}
                                        {postData.media[currentMediaIndex].fileName.match(/\.(mp4|webm|ogg)$/i) ? (
                                            <video
                                                src={POST_MEDIA_URL + postData.media[currentMediaIndex].fileName}
                                                controls
                                                className={additionalStyles["media-content"]}
                                                onLoadedData={() => setIsImageLoaded(true)}
                                            />
                                        ) : (
                                            <img
                                                src={POST_MEDIA_URL + postData.media[currentMediaIndex].fileName}
                                                alt={`Post media ${currentMediaIndex + 1}`}
                                                className={additionalStyles["media-content"]}
                                                onLoad={() => setIsImageLoaded(true)}
                                            />
                                        )}

                                        {/* Media dots indicator */}
                                        {postData.media.length > 1 && (
                                            <div className={additionalStyles["media-dots"]}>
                                                {postData.media.map((_, index) => (
                                                    <span
                                                        key={index}
                                                        className={`${additionalStyles["media-dot"]} ${index === currentMediaIndex ? additionalStyles["active"] : ""}`}
                                                        onClick={() => {
                                                            setIsImageLoaded(false);
                                                            setCurrentMediaIndex(index);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faCircle} size="xs" />
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className={additionalStyles["no-media"]}>No media</div>
                                )}
                                {!isImageLoaded && <div className={styles["loading-spinner"]}></div>}
                            </div>
                        </div>

                        {/* Right side - Content */}
                        <div className={styles["post-content"]}>
                            <div className={styles["post-header"]}>
                                <img
                                    src={AVATAR_URL + postData.creator.avatar}
                                    alt="avatar"
                                    className={styles["avatar"]}
                                />
                                <span className={styles["username"]}>{postData.creator.username}</span>
                            </div>
                            <div>
                                <hr className={styles["line"]} />
                            </div>                            <div className={styles["post-body"]}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: postData.content }}
                                    className={additionalStyles["post-content-html"]}
                                />
                                {postData.hashtags && postData.hashtags.length > 0 && (
                                    <div className={styles["hashtags"]}>
                                        {postData.hashtags.map((tag, index) => (
                                            <span key={index} className={styles["hashtag"]}>
                                                #{tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div><div className={styles["post-footer"]}>
                                <div className={styles["stats"]}>
                                    <span className={styles["likes"]}>{postData.likes} likes</span>
                                    {/* formatTime(postData.createdAt) */}
                                    <span className={styles["time"]}>{postData.createdAt}</span>
                                </div>

                                <div className={styles["comments-section"]}>
                                    {postData.comments && postData.comments.length > 0 ? (
                                        postData.comments.map((comment, index) => (
                                            <div key={index} className={styles["comment"]}>
                                                <span className={styles["comment-username"]}>{comment.creator.username}</span>
                                                <span className={styles["comment-text"]}>{comment.content}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className={styles["no-comments"]}>No comments yet. Be the first to comment!</p>
                                    )}
                                </div>

                                <div className={styles["comment-form"]}>
                                    <input
                                        type="text"
                                        className={styles["comment-input"]}
                                        placeholder="Add a comment..."
                                    />
                                    <span className={styles["submit-button-container"]}>
                                        <button className={styles["submit-button"]}>Post</button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDetailPage;
