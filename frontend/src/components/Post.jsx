import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../assets/css/Post.module.css';

// Import icons
import likeIcon from '../assets/images/traitim2.png';
import commentIcon from '../assets/images/binhluan2.png';
import shareIcon from '../assets/images/chiase2.png';
import saveIcon from '../assets/images/—Pngtree—a set of instagram icons_9062112 (1) (1).png';

const Post = ({ id = '1', username, userAvatar, image, likes, caption }) => {
    const navigate = useNavigate();
    const location = useLocation();

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

    return (
        <div className={styles.post} onClick={handlePostClick}>
            <div className={styles.postUser}>
                <img src={userAvatar} alt={username} className={styles.avatar} />
                <p>{username}</p>
            </div>

            <div className={styles.imgContainer}>
                <img src={image} alt="Post content" />
            </div>

            <div className={styles.icon}>
                <div className={styles.leftIcon}>
                    <span><img src={likeIcon} alt="Like" /></span>
                    <span><img src={commentIcon} alt="Comment" /></span>
                    <span><img src={shareIcon} alt="Share" /></span>
                </div>
                <div className={styles.rightIcon}>
                    <img src={saveIcon} alt="Save" className={styles.icon2} />
                </div>
            </div>

            <p>{likes} likes</p>
            <p>
                {caption.length > 30 ?
                    <>
                        {caption.substring(0, 30)}... <span className={styles.comment}>more</span>
                    </> :
                    caption
                }
            </p>
            <p className={styles.comment} onClick={handleViewAllComments}>View all comments</p>
            <p className={styles.comment}>Add a comment...</p>
        </div>
    );
};

export default Post;
