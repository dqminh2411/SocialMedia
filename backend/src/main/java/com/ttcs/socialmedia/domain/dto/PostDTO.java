package com.ttcs.socialmedia.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class PostDTO {
    private int id;
    private String content;
    private UserDTO userDTO;
    private List<String> imageNames;
    private int likes;
    private Instant createdAt;
    private List<CommentDTO> comments;

}
