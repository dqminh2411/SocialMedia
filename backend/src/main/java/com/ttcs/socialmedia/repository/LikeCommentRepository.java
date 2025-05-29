package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Comment;
import com.ttcs.socialmedia.domain.LikeComment;
import com.ttcs.socialmedia.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeCommentRepository extends JpaRepository<LikeComment, Integer> {
    int countByComment(Comment comment);

    LikeComment findByCommentAndUser(Comment comment, User user);
}
