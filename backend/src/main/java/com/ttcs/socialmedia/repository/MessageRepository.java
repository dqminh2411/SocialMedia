package com.ttcs.socialmedia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ttcs.socialmedia.domain.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByChatId(Integer chatId);

    Message findTopByChatIdOrderBySentAtDesc(Integer chatId); // To get the last message in a chat
}
