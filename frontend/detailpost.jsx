import React from "react";
import "postdetail.css";
const PostDetail = () => {
  return (
    <div className="post-container">
      <div className="post-card">
        {/* Left side - Image or quote */}
        <div className="post-image">
          <img src="anh10.png"/>
        </div>

        {/* Right side - Content */}
        <div className="post-content">
          <div className="post-header">
            <img src="your-avatar-url.jpg" alt="avatar" className="avatar" />
            <span className="username">jimkwik</span>
          </div>
          <div> <hr className="line"/> </div>
          <div className="post-body">
            <p>
              💬 Whats one habit or sacrifice that helped you hit a goal—but
              most people never saw? Share in the comments ⬇️
            </p>
            <p>Its easy to look at successful people and think:</p>
            <ul>
              <li>“Must be nice.”</li>
              <li>“Mustve had connections.”</li>
              <li>“Mustve known what they were doing.”</li>
              <li>“I could never achieve that.”</li>
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
          </div>

          <div className="post-footer">
            <span className="time">17 hours ago</span>
            <input
              type="text"
              className="comment-input"
              placeholder="Add a comment..."
            />
            <span>
              {" "}
              <button>submit</button>{" "}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
