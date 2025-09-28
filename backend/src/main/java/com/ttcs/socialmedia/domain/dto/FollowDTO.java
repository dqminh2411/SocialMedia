package com.ttcs.socialmedia.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FollowDTO {
    private int id;
    private int followedUserId;
}
