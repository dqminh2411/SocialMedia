package com.ttcs.socialmedia.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ttcs.socialmedia.domain.Chat;
import com.ttcs.socialmedia.domain.dto.ChatDTO;
import com.ttcs.socialmedia.domain.dto.MessageDTO;
import com.ttcs.socialmedia.domain.dto.NotificationDTO;
import com.ttcs.socialmedia.service.ChatService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@AllArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @GetMapping("/{chatId}")
    public ResponseEntity<?> getChatMessages(@PathVariable("chatId") Integer chatId) {
        // Fetch messages for the given chatId
        return ResponseEntity.ok(chatService.getMessagesByChatId(chatId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserChats(@PathVariable("userId") Integer userId) {
        // Fetch chats for the given userId
        return ResponseEntity.ok(chatService.getChatsByUserId(userId));
    }

    @PostMapping("")
    public ResponseEntity<?> createChat(@RequestBody ChatDTO chatDTO) {
        ChatDTO chat = null;
        try {
            chat = chatService.createChat(chatDTO);
        } catch (Exception e) {
            return ResponseEntity.ok().body("Chat existed");
        }
        return ResponseEntity.ok(chat);
    }
}
