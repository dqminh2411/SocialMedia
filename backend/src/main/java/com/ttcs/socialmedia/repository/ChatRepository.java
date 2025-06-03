package com.ttcs.socialmedia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ttcs.socialmedia.domain.Chat;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Integer> {
    // Define any custom query methods if needed
    @Query("SELECT c FROM Chat c WHERE c.user1.id = :userId OR c.user2.id = :userId")
    List<Chat> findByOneUser(Integer userId);

    @Query("SELECT COUNT(c) > 0 FROM Chat c WHERE (c.user1.id = :user1Id AND c.user2.id = :user2Id) OR (c.user1.id = :user2Id AND c.user2.id = :user1Id)")
    boolean existsByUsers(Integer user1Id, Integer user2Id);
}
