package com.ttcs.socialmedia.domain.dto;

import java.time.Instant;

import com.ttcs.socialmedia.util.constants.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private Instant createdAt;
}
