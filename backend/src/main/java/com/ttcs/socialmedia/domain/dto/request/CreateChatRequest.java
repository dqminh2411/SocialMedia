package com.ttcs.socialmedia.domain.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateChatRequest {
    private int user1Id;
    private int user2Id;
}
