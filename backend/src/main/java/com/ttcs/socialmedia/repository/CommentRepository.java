package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Comment;
import com.ttcs.socialmedia.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    Page<Comment> findByPostOrderByCreatedAtDesc(Post post, Pageable pageable);

    Page<Comment> findByParentOrderByCreatedAtDesc(Comment parentComment, Pageable pageable);

    int countByPost(Post post);
}
