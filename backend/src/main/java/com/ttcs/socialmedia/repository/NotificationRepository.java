package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Notification;
import com.ttcs.socialmedia.util.constants.NotificationType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByRecipientId(int recipientId, Pageable pageable);

    List<Notification> findByRecipientIdAndReadFalse(int recipientId);

    int countByRecipientIdAndReadFalse(int recipientId);

    List<Notification> findBySenderIdAndType(int senderId, NotificationType type);
}
