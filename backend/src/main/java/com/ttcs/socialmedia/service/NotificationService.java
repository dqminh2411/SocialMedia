package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Notification;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.NotificationDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.repository.NotificationRepository;
import com.ttcs.socialmedia.util.constants.NotificationType;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public NotificationService(NotificationRepository notificationRepository, UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    public Notification saveNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Notification getNotificationById(int id) {
        return notificationRepository.findById(id).orElse(null);
    }

    public List<NotificationDTO> getNotificationsForUser(String userEmail, int page, int size) {
        User user = userService.getUserByEmail(userEmail);

        if (user == null) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return notificationRepository.findByRecipientId(user.getId(), pageable)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public boolean markAsRead(int notificationId, String userEmail) {
        User user = userService.getUserByEmail(userEmail);

        if (user == null) {
            return false;
        }

        Notification notification = notificationRepository.findById(notificationId).orElse(null);

        if (notification == null || notification.getRecipient().getId() != user.getId()) {
            return false;
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        return true;
    }

    public void markAllAsRead(String userEmail) {
        User user = userService.getUserByEmail(userEmail);

        if (user == null) {
            return;
        }

        List<Notification> unreadNotifications = notificationRepository.findByRecipientIdAndReadFalse(user.getId());

        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
        });

        notificationRepository.saveAll(unreadNotifications);
    }

    public NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setContent(notification.getContent());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setType(notification.getType());
        dto.setReferencedId(notification.getReferencedId());

        UserDTO senderDTO = userService.userToUserDTO(notification.getSender());
        UserDTO recipientDTO = userService.userToUserDTO(notification.getRecipient());

        dto.setSender(senderDTO);
        dto.setRecipient(recipientDTO);

        return dto;
    }

    public List<Notification> getSentFollowRequests(int senderId) {
        return notificationRepository.findBySenderIdAndType(
                senderId, NotificationType.FOLLOW_REQUEST);
    }
}
