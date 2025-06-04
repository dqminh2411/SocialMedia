package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Follow;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.util.constants.FollowStatus;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {
    int countByFollowingUserAndStatus(User followingUser, FollowStatus status);

    int countByFollowedUserAndStatus(User followedUser, FollowStatus status);

    Page<Follow> findByFollowedUser(User followedUser, Pageable pageable);

    Page<Follow> findByFollowingUser(User followingUser, Pageable pageable);

    Follow findById(int id);

    @Query("SELECT f.status FROM Follow f WHERE f.followingUser.id = :followingUserId AND f.followedUser.id = :followedUserId")
    String checkFollowStatus(int followingUserId, int followedUserId);

    @Query("SELECT f FROM Follow f WHERE f.followingUser = :followingUser AND f.followedUser = :followedUser")
    Follow findByFollowingUserAndFollowedUser(User followingUser, User followedUser);

    @Query("SELECT f.followingUser FROM Follow f WHERE f.followedUser = :followedUser AND f.status = :status AND LOWER(f.followingUser.username) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> findUserFollowerByStatus(User followedUser, FollowStatus status, String query, Pageable pageable);

    @Query("SELECT f.followedUser FROM Follow f WHERE f.followingUser = :followingUser AND f.status = :status AND LOWER(f.followedUser.username) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> findUserFollowingByStatus(User followingUser, FollowStatus status, String query, Pageable pageable);
}
