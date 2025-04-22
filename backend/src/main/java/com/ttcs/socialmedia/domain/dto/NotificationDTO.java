package com.ttcs.socialmedia.domain.dto;

import com.ttcs.socialmedia.util.constants.NotificationType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class NotificationDTO {
    private int id;
    private String content;
    private boolean read;
    private Instant createdAt;
    private UserDTO recipient;
    private UserDTO sender;
    private NotificationType type;
    private int referencedId;
}
