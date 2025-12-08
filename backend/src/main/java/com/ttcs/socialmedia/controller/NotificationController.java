package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.Follow;
import com.ttcs.socialmedia.domain.Notification;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.FollowDTO;
import com.ttcs.socialmedia.domain.dto.NotificationDTO;
import com.ttcs.socialmedia.service.FollowService;
import com.ttcs.socialmedia.service.NotificationService;
import com.ttcs.socialmedia.service.UserService;
import com.ttcs.socialmedia.util.SecurityUtil;
import com.ttcs.socialmedia.util.constants.NotificationType;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${apiPrefix}/notifications")
@AllArgsConstructor
public class NotificationController {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final UserService userService;
    private final NotificationService notificationService;
    private final FollowService followService;

    @PostMapping("/follow-request")
    public ResponseEntity<?> sendFollowRequest(@RequestBody Map<String, Integer> request) {
        String currentUserEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        User sender = userService.getUserByEmail(currentUserEmail);
        User recipient = userService.getUserById(request.get("recipientId"));

        if (sender == null || recipient == null) {
            return ResponseEntity.badRequest().body("Invalid user IDs");
        }
        // check if request existed

        Follow follow = followService.getFollowByUsers(sender.getId(), recipient.getId());
        if (follow != null) {
            return ResponseEntity.badRequest().body("Follow request already sent");
        }
        // Create notification
        Notification notification = new Notification();
        notification.setSender(sender);
        notification.setRecipient(recipient);
        notification.setContent(sender.getUsername() + " requested to follow you");
        notification.setType(NotificationType.FOLLOW_REQUEST);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());

        Notification savedNotification = notificationService.saveNotification(notification);

        // Convert to DTO for WebSocket
        NotificationDTO notificationDTO = notificationService.convertToDTO(savedNotification);

        FollowDTO followDTO = new FollowDTO();
        followDTO.setFollowedUserId(recipient.getId());
        followService.createFollow(followDTO);

        // Send via WebSocket
        // simpMessagingTemplate.convertAndSendToUser(
        // recipient.getEmail(),
        // "/topic/notifications",
        // notificationDTO);

        return ResponseEntity.ok(notificationDTO);
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptFollowRequest(@RequestBody() NotificationDTO notificationDTO) {
        String currentUserEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        Notification notification = notificationService.getNotificationById(notificationDTO.getId());

        if (notification == null) {
            return ResponseEntity.badRequest().body("Notification not found");
        }

        // Check if current user is the recipient
        if (!notification.getRecipient().getEmail().equals(currentUserEmail)) {
            return ResponseEntity.badRequest().body("Not authorized to accept this request");
        }

        // Accept follow request
        // userService.acceptFollowRequest(notification.getSender().getId(),
        // notification.getRecipient().getId());
        Follow follow = followService.getFollowByUsers(notification.getSender().getId(),
                notification.getRecipient().getId());
        followService.confirmFollow(follow.getId());
        // Mark notification as read
        notification.setRead(true);
        notificationService.saveNotification(notification);

        // Create a notification for the sender
        Notification acceptNotification = new Notification();
        acceptNotification.setSender(notification.getRecipient());
        acceptNotification.setRecipient(notification.getSender());
        acceptNotification.setContent(notification.getRecipient().getUsername() + " accepted your follow request");
        acceptNotification.setType(NotificationType.FOLLOW_ACCEPTED);
        acceptNotification.setRead(false);
        acceptNotification.setCreatedAt(Instant.now());

        notificationService.saveNotification(acceptNotification);

        // Send notification via WebSocket
        // NotificationDTO acceptNotificationDTO =
        // notificationService.convertToDTO(savedAcceptNotification);
        // simpMessagingTemplate.convertAndSendToUser(
        // notification.getSender().getEmail(),
        // "/topic/notifications",
        // acceptNotificationDTO);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectFollowRequest(@PathVariable("id") int notificationId) {
        String currentUserEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        Notification notification = notificationService.getNotificationById(notificationId);

        if (notification == null) {
            return ResponseEntity.badRequest().body("Notification not found");
        }

        Follow follow = followService.getFollowByUsers(notification.getSender().getId(),
                notification.getRecipient().getId());
        followService.deleteFollow(follow.getId());
        // Check if current user is the recipient
        if (!notification.getRecipient().getEmail().equals(currentUserEmail)) {
            return ResponseEntity.badRequest().body("Not authorized to reject this request");
        }

        // Mark notification as read
        notification.setRead(true);
        notificationService.saveNotification(notification);

        return ResponseEntity.ok().build();
    }

    @GetMapping("")
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String currentUserEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        List<NotificationDTO> notifications = notificationService.getNotificationsForUser(currentUserEmail, page, size);

        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable("id") int notificationId) {
        String currentUserEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        boolean ok = notificationService.markAsRead(notificationId, currentUserEmail);

        if (!ok) {
            return ResponseEntity.badRequest().body("Notification not found");
        }

        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        String currentUserEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        notificationService.markAllAsRead(currentUserEmail);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/test")
    public ResponseEntity<?> sendTestNotification(@RequestBody NotificationDTO notificationDTO) {
        // This is a test endpoint to send a notification directly via WebSocket
        if (notificationDTO.getRecipient() == null || notificationDTO.getRecipient().getEmail() == null) {
            return ResponseEntity.badRequest().body("Recipient email is required");
        }

        // Send notification via WebSocket
        simpMessagingTemplate.convertAndSendToUser(
                notificationDTO.getRecipient().getEmail(),
                "/topic",
                notificationDTO);

        return ResponseEntity.ok().body(Map.of("message", "Test notification sent successfully"));
    }

    @GetMapping("/sent-requests")
    public ResponseEntity<List<NotificationDTO>> getSentFollowRequests() {
        String currentUserEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        User sender = userService.getUserByEmail(currentUserEmail);

        List<Notification> sentRequests = notificationService.getSentFollowRequests(sender.getId());
        List<NotificationDTO> sentRequestDTOs = sentRequests.stream()
                .map(notificationService::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(sentRequestDTOs);
    }
}
