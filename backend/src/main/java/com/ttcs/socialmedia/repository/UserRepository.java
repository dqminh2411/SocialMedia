package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);

    User findByEmail(String email);

    User findById(int id);

    User findByEmailAndRefreshToken(String email, String refreshToken);

    User findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT f.followedUser.id FROM Follow f WHERE f.followingUser.id = :userId ) AND u.role != 'ADMIN' AND u.id != :userId")
    Page<User> findUsersNotFollowed(int userId, Pageable page);
}
