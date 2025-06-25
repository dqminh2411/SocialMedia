package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByChatId(Integer chatId);

    Message findTopByChatIdOrderBySentAtDesc(Integer chatId); // To get the last message in a chat
}
