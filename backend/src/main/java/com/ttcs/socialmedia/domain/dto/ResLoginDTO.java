package com.ttcs.socialmedia.domain.dto;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Setter
@Getter

public class ResLoginDTO {
    private String accessToken;
    private UserDTO userDTO;
}

