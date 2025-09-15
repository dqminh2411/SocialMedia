package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);

    User findByEmail(String email);

    User findById(int id);

    User findByEmailAndRefreshToken(String email, String refreshToken);

    User findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT f.followedUser.id FROM Follow f WHERE f.followingUser.id = :userId ) AND u.role.name != 'ADMIN' AND u.id != :userId")
    Page<User> findUsersNotFollowed(int userId, Pageable page);

    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
            "(LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) ) AND " +
            "u.email != :currentEmail "+
            "ORDER BY u.createdAt DESC")
    Page<User> findByUsernameOrEmailContainingIgnoreCase(String currentEmail,@Param("search") String search, Pageable pageable);
}
