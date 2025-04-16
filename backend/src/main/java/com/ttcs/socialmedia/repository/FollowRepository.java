package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Follow;
import com.ttcs.socialmedia.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {
    int countByFollowingUser(User followingUser);
    int countByFollowedUser(User followedUser);
    Page<Follow> findByFollowedUser(User followedUser, Pageable pageable);
    Page<Follow> findByFollowingUser(User followingUser, Pageable pageable);
}
