package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.LikePost;
import com.ttcs.socialmedia.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikePostRepository extends JpaRepository<LikePost,Integer> {
    int countByPost(Post post);
}
