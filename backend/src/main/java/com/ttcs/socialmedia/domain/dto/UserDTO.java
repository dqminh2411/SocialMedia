package com.ttcs.socialmedia.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private int id;
    private String email;
    private String username;
    private String fullname;
    private String avatar;
    private String role;
    private String provider;
    private Instant createdAt;
}
