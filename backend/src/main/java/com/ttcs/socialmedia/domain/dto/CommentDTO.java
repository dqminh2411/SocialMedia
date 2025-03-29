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
    private Instant createdAt;
    private String taggedUsername;
}
