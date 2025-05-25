import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "../assets/css/PostDetail.module.css";

const PostDetailPage = () => {
    // In a real application, you would use the postId to fetch post details from an API
    const { postId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const background = location.state?.background;
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // Mock post data - in a real app, fetch this data based on postId
    const postData = {
        id: postId,
        username: 'jimkwik',
        userAvatar: '/daidien.png',
        image: '/anh10.png',
        likes: 1250,
        caption: '💬 Whats one habit or sacrifice that helped you hit a goal—but most people never saw? Share in the comments ⬇️',
        comments: [],
        time: '17 hours ago'
    };    // Close the popup when clicking outside the post card
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
    }, [navigate, background]); return (
        <div
            className={background ? styles["modal-overlay"] : styles["page-container"]}
            onClick={background ? handleOverlayClick : undefined}
        >
            <div className={styles["post-container"]}>
                <div className={styles["post-card"]}>
                    {/* Close button - only show in modal view */}
                    {background && (
                        <button className={styles["close-button"]} onClick={() => navigate(-1)}>×</button>
                    )}{/* Left side - Image or quote */}
                    <div className={styles["post-image"]}>
                        <div className={`${styles["image-container"]} ${isImageLoaded ? styles["loaded"] : styles["loading"]}`}>
                            <img
                                src={postData.image}
                                alt="Post image"
                                onLoad={() => setIsImageLoaded(true)}
                            />
                            {!isImageLoaded && <div className={styles["loading-spinner"]}></div>}
                        </div>
                    </div>

                    {/* Right side - Content */}
                    <div className={styles["post-content"]}>
                        <div className={styles["post-header"]}>
                            <img src={postData.userAvatar} alt="avatar" className={styles["avatar"]} />
                            <span className={styles["username"]}>{postData.username}</span>
                        </div>
                        <div>
                            <hr className={styles["line"]} />
                        </div>
                        <div className={styles["post-body"]}>
                            <p>
                                💬 Whats one habit or sacrifice that helped you hit a goal—but
                                most people never saw? Share in the comments ⬇️
                            </p>
                            <p>Its easy to look at successful people and think:</p>
                            <ul>
                                <li>"Must be nice."</li>
                                <li>"Mustve had connections."</li>
                                <li>"Mustve known what they were doing."</li>
                                <li>"I could never achieve that."</li>
                            </ul>
                            <p>
                                But the truth is, most of them started where you are now. <br />
                                Getting rejected. Wondering if they should give up.
                            </p>
                            <p>
                                But they didnt stop. <br />
                                They kept showing up. <br />
                                They kept failing, learning and adapting.
                            </p>
                        </div>                        <div className={styles["post-footer"]}>
                            <span className={styles["time"]}>{postData.time}</span>
                            <div className={styles["comments-section"]}>
                                {postData.comments && postData.comments.length > 0 ? (
                                    postData.comments.map((comment, index) => (
                                        <div key={index} className={styles["comment"]}>
                                            <span className={styles["comment-username"]}>{comment.username}</span>
                                            <span className={styles["comment-text"]}>{comment.text}</span>
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
        </div>
    );
};

export default PostDetailPage;
