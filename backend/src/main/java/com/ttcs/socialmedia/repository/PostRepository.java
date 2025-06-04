package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Hashtag;
import com.ttcs.socialmedia.domain.Post;
import com.ttcs.socialmedia.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
        Post findById(int id);

        Page<Post> findByCreator(User user, Pageable pageable);

        int countByCreator(User user);

        @Query("""
                                SELECT p FROM Post p WHERE NOT EXISTS
                                        (SELECT 1 FROM Follow f
                                                WHERE f.followingUser.id = :currentUserId
                                                AND f.status = 'CONFIRMED'
                                                AND p.creator.id = f.followedUser.id )
                                        AND p.creator.id != :currentUserId
                                        ORDER BY FUNCTION('DATE', p.createdAt) DESC, p.likesCount DESC, p.commentsCount DESC
                        """)
        Page<Post> findPostsFromUnfollowedUsers(@Param("currentUserId") int currentUserId, Pageable pageable);

        @Query("SELECT p FROM Post p WHERE EXISTS " +
                        "(SELECT 1 FROM Follow f WHERE f.followingUser.id = :currentUserId AND f.followedUser.id = p.creator.id AND f.status = 'CONFIRMED')"
                        +
                        "ORDER BY p.createdAt DESC")
        Page<Post> findPostsFromFollowedUsers(@Param("currentUserId") int currentUserId, Pageable pageable);

        @Query("SELECT p FROM Post p JOIN PostHashtags ph ON p.id = ph.post.id WHERE ph.hashtag = :hashtag " +
                        "ORDER BY p.createdAt DESC, p.likesCount DESC, p.commentsCount DESC")
        Page<Post> findByHashtag(@Param("hashtag") Hashtag hashtag, Pageable pageable);
}
