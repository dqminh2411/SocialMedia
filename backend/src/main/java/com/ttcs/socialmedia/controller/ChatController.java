package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.dto.ChatDTO;
import com.ttcs.socialmedia.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
//    public ChatController(ChatService chatService) {
//        this.chatService = chatService;
//    }

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
