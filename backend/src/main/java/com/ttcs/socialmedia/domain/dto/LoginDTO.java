package com.ttcs.socialmedia.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDTO {
    @NotBlank(message = "Email không được để trống")
    private String email;
    @NotBlank(message = "password không được để trống")
    private String password;
}
