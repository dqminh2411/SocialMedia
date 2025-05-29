package com.ttcs.socialmedia.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CommentDTO {
    private int id;
    private String content;
    private UserDTO userDTO;
    private int likes;
    private int parentId;
    private int postId;
    private Instant createdAt;
    private boolean likedByCurrentUser;
}
