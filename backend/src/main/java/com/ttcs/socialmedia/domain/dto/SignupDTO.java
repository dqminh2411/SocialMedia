package com.ttcs.socialmedia.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor

public class SignupDTO {
    @NotBlank(message = "Họ và tên không được để trống")
    private String fullname;
    @Email(regexp = "^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$", message = "Email không hợp lệ")
    private String email;
    @Size(min=8, message = "Mật khẩu cần chứa ít nhất 8 ký tự")
    private String password;
    private String rePassword;

    public @NotBlank(message = "Họ và tên không được để trống") String getFullname() {
        return fullname;
    }

    public void setFullname(@NotBlank(message = "Họ và tên không được để trống") String fullname) {
        this.fullname = fullname;
    }

    public @Email(regexp = "^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$",message = "Email không hợp lệ") String getEmail() {
        return email;
    }

    public void setEmail(@Email(regexp = "^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$",message = "Email không hợp lệ") String email) {
        this.email = email;
    }

    public @Size(min = 8, message = "Mật khẩu cần chứa ít nhất 8 ký tự") String getPassword() {
        return password;
    }

    public void setPassword(@Size(min = 8, message = "Mật khẩu cần chứa ít nhất 8 ký tự") String password) {
        this.password = password;
    }

    public String getRePassword() {
        return rePassword;
    }

    public void setRePassword(String rePassword) {
        this.rePassword = rePassword;
    }
}
