package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.Chat;
import com.ttcs.socialmedia.domain.Message;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.MessageDTO;
import com.ttcs.socialmedia.service.ChatService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
@AllArgsConstructor
public class MessageController {
    private final ChatService chatService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat")
    public ResponseEntity<?> sendMessage(@RequestBody MessageDTO message) {
        // Send to the topic destination that the frontend is subscribed to
        Chat chat = chatService.getChatById(message.getChatId());
        if (chat == null) {
            return ResponseEntity.badRequest().body("Chat not found");
        }
        Message savedMessage = chatService.saveMessage(message);
        if (savedMessage == null) {
            return ResponseEntity.badRequest().body("Failed to save message");
        }
        User recipient = chat.getUser1().getId() == message.getSenderId() ? chat.getUser2() : chat.getUser1();

        MessageDTO messageDTO = chatService.messageToDTO(savedMessage);
        simpMessagingTemplate.convertAndSendToUser(recipient.getEmail(), "/chat", messageDTO);

        return ResponseEntity.ok(messageDTO);
    }
}
