package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Notification;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.repository.NotificationRepository;
import com.ttcs.socialmedia.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@AllArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;


//    public void sendNotification(int userId, String content, NotificationType type, Object ) {
//        User user = userRepository.findById(userId);
//        Notification noti = new Notification();
//        noti.setRecipient(user);
//        noti.setContent(content);
//        noti.setType(type);
//        noti.setReferencedObject(refId);
//        notificationRepository.save(noti);
//    }

    public List<Notification> getNotifications(int userId) {
        User user = userRepository.findById(userId);
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    public void markAsRead(int notificationId) {
        Notification noti = notificationRepository.findById(notificationId);
        noti.setRead(true);
        notificationRepository.save(noti);
    }
}
