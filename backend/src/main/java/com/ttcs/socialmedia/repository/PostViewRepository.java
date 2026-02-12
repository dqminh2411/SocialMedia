package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Post;
import com.ttcs.socialmedia.domain.PostView;
import com.ttcs.socialmedia.domain.PostViewId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostViewRepository extends JpaRepository<PostView, PostViewId> {
}
