package com.ttcs.socialmedia.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResProfileDTO {
    private int id;
    private UserDTO userDTO;
    private String bio;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss a", timezone = "GMT+7")
    private Instant updateAt;
    private int totalPostCount;
    private int totalFollowerCount;
    private int totalFollowingCount;
    private List<PostDTO> posts;

}
