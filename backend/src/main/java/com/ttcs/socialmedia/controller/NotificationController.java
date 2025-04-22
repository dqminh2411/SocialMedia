package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.dto.NotificationDTO;
import com.ttcs.socialmedia.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class NotificationController {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final UserService userService;
    @MessageMapping("/chat")
    public ResponseEntity<?> likePost(@RequestBody NotificationDTO noti){
        simpMessagingTemplate.convertAndSendToUser(noti.getRecipient().getEmail(),"/topic", noti);
        return ResponseEntity.ok("msg sent");
    }
}
