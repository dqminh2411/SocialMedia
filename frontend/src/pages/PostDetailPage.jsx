import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import styles from "../assets/css/PostDetail.module.css";
import additionalStyles from "../assets/css/PostDetailAdditions.module.css";
import "../assets/css/CommentFormFix.css"; // Import fix for comment form
import PostService from "../services/post.service";
import CommentService from "../services/comment.service";
import AuthService from "../services/auth.service";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faChevronLeft, faChevronRight, faCircle, faReply, faTrash, faEdit, faPencilAlt, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const PostDetailPage = () => {
    const POST_MEDIA_URL = 'http://localhost:8080/storage/posts/';
    const AVATAR_URL = 'http://localhost:8080/storage/avatars/';
    const DEFAULT_AVATAR = 'defaultAvatar.jpg';
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
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingComment, setEditingComment] = useState(null); const [editText, setEditText] = useState('');
    const [showReplies, setShowReplies] = useState({}); const [loadingComments, setLoadingComments] = useState(false);
    const commentRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);    // Fetch post details from API
    const [clickedLike, setClickedLike] = useState(false);
    const [postComment, setPostComment] = useState(false);
    useEffect(() => {
        // Get current user from AuthService
        const user = AuthService.getCurrentUser();
        setCurrentUser(user?.user || null);

        setLoading(true);
        PostService.getPostDetails(postId)
            .then(data => {
                console.log("Post details fetched:", data);
                setPostData(data);
                setIsLiked(data.likedByCurrentUser || false);
                setLikeCount(data.likes || 0);
                setLoading(false);

                // Fetch comments after post details are loaded
                fetchComments(1);
            })
            .catch(err => {
                console.error("Error fetching post details:", err);
                setError("Failed to load post details. Please try again later.");
                setLoading(false);
            });
    }, [postId]);    // Fetch comments for the post
    const fetchComments = (page) => {
        setLoadingComments(true);
        CommentService.getComments(postId, page)
            .then(data => {
                const safeData = Array.isArray(data) ? data : [];

                if (page === 1) {
                    setComments(safeData);
                } else {
                    setComments(prevComments => {
                        const safeComments = Array.isArray(prevComments) ? prevComments : [];
                        return [...safeComments, ...safeData];
                    });
                }
                setCurrentPage(page);
                setLoadingComments(false);
            })
            .catch(err => {
                console.error("Error fetching comments:", err);
                setLoadingComments(false);
            });
    };

    // Load more comments
    const loadMoreComments = () => {
        fetchComments(currentPage + 1);
    };    // Handle posting a new comment
    const handlePostComment = async () => {
        if (!commentText.trim()) return;

        try {
            setPostComment(true);
            const newComment = await CommentService.addComment(postId, commentText);

            if (newComment) {
                setComments(prevComments => {
                    const safeComments = Array.isArray(prevComments) ? prevComments : [];
                    return [newComment, ...safeComments];
                });
            }
            setCommentText('');
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };// Handle toggling like on a comment
    const handleLikeComment = async (commentId) => {

        try {
            await CommentService.likeComment(commentId);

            // Update comments state with optimistic update
            setComments(prevComments => (prevComments || []).map(comment => {
                if (comment && comment.id === commentId) {
                    return {
                        ...comment,
                        likes: comment.likedByCurrentUser ? comment.likes - 1 : comment.likes + 1,
                        likedByCurrentUser: !comment.likedByCurrentUser
                    };
                }
                return comment;
            }));
        } catch (error) {
            console.error("Error liking comment:", error);
        }
    };    // Toggle showing replies for a comment
    const toggleReplies = async (commentId) => {
        // If already showing, hide them
        if (showReplies[commentId]) {
            setShowReplies(prev => ({ ...prev, [commentId]: false }));
            return;
        }

        // Fetch replies
        try {
            const replies = await CommentService.getReplies(commentId, 1);

            // Add replies to the comment
            setComments(prevComments => (prevComments || []).map(comment => {
                if (comment && comment.id === commentId) {
                    return { ...comment, replies: replies || [] };
                }
                return comment;
            }));

            // Show replies
            setShowReplies(prev => ({ ...prev, [commentId]: true }));
        } catch (error) {
            console.error("Error fetching replies:", error);
        }
    };    // Handle replying to a comment
    const handleReplyComment = async () => {
        if (!replyText.trim() || !replyingTo) return;

        try {
            const newReply = await CommentService.addReply(replyingTo, replyText);

            // Update the comment with the new reply
            setComments(prevComments => (prevComments || []).map(comment => {
                if (comment && comment.id === replyingTo) {
                    const currentReplies = Array.isArray(comment.replies) ? comment.replies : [];
                    const updatedReplies = newReply ? [newReply, ...currentReplies] : currentReplies;
                    return { ...comment, replies: updatedReplies };
                }
                return comment;
            }));

            // Reset reply state
            setReplyingTo(null);
            setReplyText('');
        } catch (error) {
            console.error("Error posting reply:", error);
        }
    };

    // Set up to edit a comment
    const startEditComment = (comment) => {
        setEditingComment(comment.id);
        setEditText(comment.content);
    };    // Handle updating a comment
    const handleUpdateComment = async () => {
        if (!editText.trim() || !editingComment) return;

        try {
            const updatedComment = await CommentService.updateComment(editingComment, editText);

            // Update the comment in state - check both main comments and replies
            setComments(prevComments => (prevComments || []).map(comment => {
                // Check if this is the comment being edited
                if (comment && comment.id === editingComment) {
                    return { ...comment, content: updatedComment?.content || comment.content };
                }

                // Check if this comment has replies and one of them is being edited
                if (comment && comment.replies && Array.isArray(comment.replies)) {
                    const updatedReplies = comment.replies.map(reply => {
                        if (reply && reply.id === editingComment) {
                            return { ...reply, content: updatedComment?.content || reply.content };
                        }
                        return reply;
                    });

                    return { ...comment, replies: updatedReplies };
                }

                return comment;
            }));

            // Reset edit state
            setEditingComment(null);
            setEditText('');
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };    // Handle deleting a comment
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await CommentService.deleteComment(commentId);

            // First check if this is a top-level comment
            const isTopLevelComment = comments.some(comment => comment && comment.id === commentId);

            if (isTopLevelComment) {
                // Remove the top-level comment from state
                setComments(prevComments => (prevComments || []).filter(comment => comment && comment.id !== commentId));
            } else {
                // This is a reply - update the parent comment's replies array
                setComments(prevComments => (prevComments || []).map(comment => {
                    if (comment && comment.replies && Array.isArray(comment.replies)) {
                        // Filter out the deleted reply
                        const updatedReplies = comment.replies.filter(reply => reply && reply.id !== commentId);

                        // If replies array changed, this was the parent comment
                        if (updatedReplies.length !== comment.replies.length) {
                            return { ...comment, replies: updatedReplies };
                        }
                    }
                    return comment;
                }));
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };    // Handle post deletion
    const handleDeletePost = async () => {
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            return;
        }

        try {
            await PostService.deletePost(postId);
            // Show success message
            alert("Post deleted successfully");

            // For modal view, first navigate back
            if (background) {
                // Use the state object to indicate a refresh is needed
                navigate('/profile', {
                    state: {
                        postDeleted: true,
                        deletedPostId: postId
                    }
                });
            } else {
                // Direct navigation to profile with replace to force refresh
                navigate('/profile', { replace: true });
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post. Please try again.");
        }
    };

    // Handle post editing - navigate to edit page
    const handleEditPost = () => {
        navigate(`/create?edit=${postId}`);
    };

    // Close the popup when clicking outside the post card
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains(styles["modal-overlay"])) {
            // Navigate back to the previous page if we came via a modal
            if (background) {
                navigate('/', {
                    state: {
                        updatedPost: {
                            id: parseInt(postId),
                            likes: likeCount,
                            likedByCurrentUser: isLiked,
                            commentsCount: comments.length
                        }
                    }
                });
            }
        }
    };

    // Close the popup when pressing the escape key
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === "Escape" && background) {
                navigate('/', {
                    state: {
                        rerender: true,
                        updatedPost: clickedLike || postComment ? {
                            id: postId,
                            likes: likeCount,
                            likedByCurrentUser: isLiked,
                            commentsCount: comments.length
                        } : null
                    }
                });
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
    }; const goToPrevMedia = () => {
        if (postData?.media && postData.media.length > 0) {
            setIsImageLoaded(false);
            setCurrentMediaIndex((prevIndex) =>
                prevIndex === 0 ? postData.media.length - 1 : prevIndex - 1
            );
        }
    };
    const handleCloseModal = () => {
        navigate('/', {
            state: {
                updatedPost: {
                    id: parseInt(postId),
                    likes: likeCount,
                    likedByCurrentUser: isLiked,
                    commentsCount: comments.length
                }
            }
        })
    }

    const handleLikePost = async () => {
        setClickedLike(true);
        try {
            const newIsLiked = !isLiked;

            setIsLiked(newIsLiked);
            setLikeCount(prevCount => newIsLiked ? prevCount + 1 : prevCount - 1);

            await PostService.likePost(postId);

            if (postData) {
                setPostData({
                    ...postData,
                    likes: newIsLiked ? postData.likes + 1 : postData.likes - 1,
                    likedByCurrentUser: newIsLiked
                });
            }
        } catch (error) {
            console.error("Error liking post:", error);
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
                    <button onClick={handleCloseModal}>Go Back</button>
                </div>
            ) : postData && (
                <div className={styles["post-container"]}>

                    <div className={styles["post-card"]}>
                        {/* Close button and post action buttons */}
                        <div className={styles["post-actions-top"]}>
                            {background && (
                                <button className={styles["close-button"]} onClick={handleCloseModal}>×</button>
                            )}

                            {/* Only show edit and delete buttons if the current user is the post creator */}
                            {currentUser && postData?.creator?.email === currentUser.email && (
                                <div className={additionalStyles["post-owner-actions"]}>
                                    <button
                                        className={additionalStyles["post-edit-btn"]}
                                        onClick={handleEditPost}
                                        title="Edit post"
                                    >
                                        <FontAwesomeIcon icon={faPencilAlt} />
                                    </button>
                                    <button
                                        className={additionalStyles["post-delete-btn"]}
                                        onClick={handleDeletePost}
                                        title="Delete post"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Left side - Image or media */}
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
                                    src={postData.creator.avatar ? AVATAR_URL + postData.creator.avatar : AVATAR_URL + DEFAULT_AVATAR}
                                    alt="avatar"
                                    className={styles["avatar"]}
                                    onError={(e) => {
                                        e.target.src = AVATAR_URL + DEFAULT_AVATAR;
                                    }}
                                />
                                <Link to={`/profile/un/${postData.creator.username}`} className={styles.userLink}>
                                    <div className={styles.userInfo}>
                                        <div className={styles.userName}>{postData.creator.username}</div>
                                    </div>
                                </Link>
                            </div>
                            <div>
                                <hr className={styles["line"]} />
                            </div>                            <div className={styles["post-body"]}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: postData.content }}
                                    className={additionalStyles["post-content-html"]}
                                />
                            </div>
                            <div className={styles["post-footer"]}>
                                <div className={styles["like-section"]}>
                                    <button
                                        className={additionalStyles["like-button"]}
                                        onClick={handleLikePost}
                                        aria-label={isLiked ? "Unlike this post" : "Like this post"}
                                    >
                                        <FontAwesomeIcon
                                            icon={isLiked ? solidHeart : regularHeart}
                                            className={isLiked ? additionalStyles["liked"] : additionalStyles["not-liked"]}
                                        />
                                    </button>
                                </div>
                                <div className={styles["stats"]}>
                                    <span className={styles["likes"]}>{likeCount} likes</span>
                                    <span className={styles["time"]}>{postData.createdAt}</span>
                                </div>

                                <div className={styles["comments-section"]}>
                                    <h3 className={additionalStyles["comments-heading"]}>Comments</h3>

                                    {Array.isArray(comments) && comments.length > 0 ? (
                                        <div className={additionalStyles["comments-list"]}>                                            {comments.map(comment => comment && (
                                            <div
                                                key={comment.id}
                                                className={`${additionalStyles["comment-item"]} ${comment.userDTO?.email === currentUser?.email ? additionalStyles["user-comment"] : ""}`}
                                            >
                                                {/* Comment content - unchanged */}
                                                <div className={additionalStyles["comment-header"]}>
                                                    <img
                                                        src={comment.userDTO?.avatar ? AVATAR_URL + comment.userDTO.avatar : AVATAR_URL + DEFAULT_AVATAR}
                                                        alt={comment.userDTO?.username}
                                                        className={additionalStyles["comment-avatar"]}
                                                        onError={(e) => {
                                                            e.target.src = AVATAR_URL + DEFAULT_AVATAR;
                                                        }}
                                                    />
                                                    <span className={additionalStyles["comment-username"]}>{comment.userDTO.username}</span>
                                                </div>

                                                <div className={additionalStyles["comment-content"]}>
                                                    {editingComment === comment.id ? (
                                                        <div className={additionalStyles["comment-edit-form"]}>
                                                            <textarea
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                className={additionalStyles["comment-edit-input"]}
                                                            />
                                                            <div className={additionalStyles["comment-edit-actions"]}>
                                                                <button
                                                                    onClick={handleUpdateComment}
                                                                    className={additionalStyles["edit-save-btn"]}
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingComment(null)}
                                                                    className={additionalStyles["edit-cancel-btn"]}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            dangerouslySetInnerHTML={{ __html: comment.content }}

                                                        />
                                                    )}
                                                </div>

                                                <div className={additionalStyles["comment-actions"]}>
                                                    <button
                                                        onClick={() => handleLikeComment(comment.id)}
                                                        className={additionalStyles["comment-like-btn"]}
                                                        aria-label={comment.likedByCurrentUser ? "Unlike comment" : "Like comment"}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={comment.likedByCurrentUser ? solidHeart : regularHeart}
                                                            className={comment.likedByCurrentUser ? additionalStyles["comment-liked"] : ""}
                                                        />
                                                        <span>{comment.likes}</span>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setReplyingTo(comment.id);
                                                            setTimeout(() => commentRef.current?.focus(), 0);
                                                        }}
                                                        className={additionalStyles["comment-reply-btn"]}
                                                    >
                                                        <FontAwesomeIcon icon={faReply} />                                                            <span>Reply</span>
                                                    </button>

                                                    {/* Show edit/delete buttons if user is the comment owner or post creator */}
                                                    {(comment.userDTO?.email === currentUser?.email || comment.userDTO?.email === postData?.creator?.email) && (
                                                        <>
                                                            <button
                                                                onClick={() => startEditComment(comment)}
                                                                className={additionalStyles["comment-edit-btn"]}
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                                <span>Edit</span>
                                                            </button>

                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className={additionalStyles["comment-delete-btn"]}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                                <span>Delete</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Show time */}
                                                <div className={additionalStyles["comment-time"]}>
                                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                </div>

                                                {/* Replies section */}
                                                {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && showReplies[comment.id] && (<div className={additionalStyles["replies-container"]}>
                                                    {comment.replies.map(reply => reply && (
                                                        <div
                                                            key={reply.id}
                                                            className={`${additionalStyles["reply-item"]} ${reply.userDTO?.email === currentUser?.email ? additionalStyles["user-comment"] : ""}`}
                                                        >
                                                            <div className={additionalStyles["comment-header"]}>
                                                                <img src={reply.userDTO?.avatar ? AVATAR_URL + reply.userDTO.avatar : AVATAR_URL + DEFAULT_AVATAR}
                                                                    alt={reply.userDTO?.username || "User"}
                                                                    className={additionalStyles["comment-avatar"]}
                                                                    onError={(e) => {
                                                                        e.target.src = AVATAR_URL + DEFAULT_AVATAR;
                                                                    }}
                                                                />
                                                                <span className={additionalStyles["comment-username"]}>{reply.userDTO?.username || "Unknown User"}</span>
                                                            </div>
                                                            <div className={additionalStyles["comment-content"]}>
                                                                <p>{reply.content}</p>
                                                            </div>
                                                            <div className={additionalStyles["comment-actions"]}>
                                                                <button
                                                                    onClick={() => handleLikeComment(reply.id)}
                                                                    className={additionalStyles["comment-like-btn"]}
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={reply.likedByCurrentUser ? solidHeart : regularHeart}
                                                                        className={reply.likedByCurrentUser ? additionalStyles["comment-liked"] : ""}
                                                                    />                                                                            <span>{reply.likes}</span>
                                                                </button>

                                                                {/* Show edit/delete buttons for replies too */}
                                                                {(reply.userDTO?.email === currentUser?.email || reply.userDTO?.email === postData?.creator?.email) && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => startEditComment(reply)}
                                                                            className={additionalStyles["comment-edit-btn"]}
                                                                        >
                                                                            <FontAwesomeIcon icon={faEdit} />
                                                                            <span>Edit</span>
                                                                        </button>

                                                                        <button
                                                                            onClick={() => handleDeleteComment(reply.id)}
                                                                            className={additionalStyles["comment-delete-btn"]}
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                            <span>Delete</span>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className={additionalStyles["comment-time"]}>
                                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                )}

                                                {/* Toggle replies button */}
                                                {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                                                    <button
                                                        onClick={() => toggleReplies(comment.id)}
                                                        className={additionalStyles["toggle-replies-btn"]}
                                                    >
                                                        {showReplies[comment.id] ? "Hide replies" : `Show ${comment.replies.length} replies`}
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                            {/* Load more comments button */}
                                            {comments.length >= 20 * currentPage && (
                                                <button
                                                    onClick={loadMoreComments}
                                                    className={additionalStyles["load-more-btn"]}
                                                    disabled={loadingComments}
                                                >
                                                    {loadingComments ? "Loading..." : "Load more comments"}
                                                </button>
                                            )}                                        </div>
                                    ) : (
                                        <p className={additionalStyles["no-comments"]}>No comments yet. Be the first to comment!</p>
                                    )}
                                </div>

                                {/* Comment input area - moved outside the scrollable area */}                                <div className={additionalStyles["comment-form-container"]}>
                                    <div className={additionalStyles["comment-form"]}>
                                        {replyingTo ? (
                                            <div className={additionalStyles["reply-header"]}>
                                                <span>Replying to comment</span>
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className={additionalStyles["cancel-reply-btn"]}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : null}

                                        <textarea
                                            ref={commentRef}
                                            value={replyingTo ? replyText : commentText}
                                            onChange={(e) => replyingTo ? setReplyText(e.target.value) : setCommentText(e.target.value)}
                                            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                                            className={additionalStyles["comment-input"]}
                                        />

                                        <button
                                            onClick={replyingTo ? handleReplyComment : handlePostComment}
                                            className={additionalStyles["post-comment-btn"]}
                                            disabled={replyingTo ? !replyText.trim() : !commentText.trim()}
                                        >
                                            {replyingTo ? "Reply" : "Post"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )
            }
        </div >);

};

export default PostDetailPage;
