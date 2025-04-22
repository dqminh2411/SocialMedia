package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Post;
import com.ttcs.socialmedia.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    Post findById(int id);
    Page<Post> findByCreatorOrderByCreatedAtDesc(User user, Pageable pageable);
    int countByCreator(User user);
}
