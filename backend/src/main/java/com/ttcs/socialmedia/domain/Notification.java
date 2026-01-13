package com.ttcs.socialmedia.domain;

import com.ttcs.socialmedia.util.constants.NotificationReferenceType;
import com.ttcs.socialmedia.util.constants.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name="notifications")
@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String content;

    @Column(name="is_read")
    private boolean read;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    private NotificationReferenceType referenceType;

    private int referencedId;

}
