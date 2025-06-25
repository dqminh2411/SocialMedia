package com.ttcs.socialmedia.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatDTO {
    private Integer id;
    private UserDTO thisUser;
    private UserDTO otherUser;
    private int thisUserId;
    private int otherUserId;
    private MessageDTO lastMessage;
}
