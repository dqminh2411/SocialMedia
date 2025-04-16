package com.ttcs.socialmedia.domain.dto;

import com.ttcs.socialmedia.domain.User;
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
}
