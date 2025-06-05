package com.ttcs.socialmedia.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class DetailPostDTO {
    private int id;
    private String content;
    private UserDTO creator;
    private int likes;
    private int commentsCount;

    @JsonFormat(timezone = "GMT+7")
    private Instant createdAt;

    @JsonFormat(timezone = "GMT+7")
    private Instant updatedAt;

    private List<PostMediaDTO> media;
    private List<HashTagDTO> hashtags;
    private List<UserDTO> mentions;
    private List<CommentDTO> comments;
    private boolean likedByCurrentUser;
}
