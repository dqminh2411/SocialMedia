package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Post;
import com.ttcs.socialmedia.domain.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostMediaRepository extends JpaRepository<PostMedia, Integer> {
    @Query("SELECT pm.fileName FROM PostMedia pm WHERE pm.post=:post ORDER BY pm.position ASC")
    List<String> findFileNamesByPostOrderByPositionAsc(Post post);
    List<PostMedia> findByPost(Post post);
    PostMedia findByFileName(String fileName);
}
