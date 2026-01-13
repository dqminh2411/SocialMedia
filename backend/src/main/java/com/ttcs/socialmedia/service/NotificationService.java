package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.*;
import com.ttcs.socialmedia.domain.dto.NotificationDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.repository.*;
import com.ttcs.socialmedia.repository.PostRepository;
import com.ttcs.socialmedia.repository.CommentRepository;
import com.ttcs.socialmedia.util.constants.NotificationReferenceType;
import com.ttcs.socialmedia.util.constants.NotificationType;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final FollowRepository followRepository;


    public Notification sendNotification(Notification notification) {
        // save notification
        notification = notificationRepository.save(notification);
        NotificationDTO notiToSend = convertToDTO(notification);
        // send
        messagingTemplate.convertAndSendToUser(notification.getRecipient().getEmail(),"/noti", notiToSend);
        return notification;
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

        List<Notification> notificationList = notificationRepository.findByRecipientId(user.getId(), pageable);
        List<Integer> commentIds = notificationList.stream()
                .filter(n -> n.getReferenceType() != null && n.getReferenceType().equals(NotificationReferenceType.COMMENT))
                .map(Notification::getReferencedId)
                .toList();

        Map<Integer, Comment> comments = commentRepository
                .findAllById(commentIds)
                .stream().collect(Collectors.toMap(Comment::getId, c->c));

        List<NotificationDTO> notificationDTOs = new ArrayList<>();
        for(Notification n : notificationList){
            NotificationDTO dto = convertToDTO(n);
            if(n.getReferenceType() != null && n.getReferenceType().equals(NotificationReferenceType.COMMENT)){
                // add post id to comment notification
                dto.setRefId2(comments.get(n.getReferencedId()).getPost().getId());
            }
            notificationDTOs.add(dto);
        }
        return notificationDTOs;
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
        dto.setReferenceType(notification.getReferenceType());
        dto.setRefId1(notification.getReferencedId());

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
