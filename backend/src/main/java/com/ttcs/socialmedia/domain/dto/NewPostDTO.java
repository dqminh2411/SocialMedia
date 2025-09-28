package com.ttcs.socialmedia.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NewPostDTO {
    private String content;
    private List<String> mentions;
    private List<String> hashtags;
}
