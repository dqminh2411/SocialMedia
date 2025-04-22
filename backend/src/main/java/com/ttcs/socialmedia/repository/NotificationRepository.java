package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Notification;
import com.ttcs.socialmedia.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    int countByRecipientAndReadFalse(User recipient);
    Notification findById(int id);
}


