package com.ttcs.socialmedia.domain.dto;

import lombok.Getter;
import lombok.Setter;
@Setter
@Getter

public class ResLoginDTO {
    private String accessToken;
    private UserDTO userDTO;
}

