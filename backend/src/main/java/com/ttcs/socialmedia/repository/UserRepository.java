package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    User findByEmail(String email);
    User findById(int id);
    User findByEmailAndRefreshToken(String email, String refreshToken);
    User findByUsername(String username);
}
