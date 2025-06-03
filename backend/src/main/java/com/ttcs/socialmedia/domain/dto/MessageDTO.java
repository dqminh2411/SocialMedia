package com.ttcs.socialmedia.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Integer id;
    private Integer chatId;
    private Integer senderId;
    private String senderUsername;
    private String senderAvatar;
    private String content;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+7")
    private Instant sentAt;

    private boolean isRead;

    // Additional fields that might be useful for the UI
    private boolean isCurrentUserSender;
    private UserDTO sender;
    private UserDTO recipient;
}
