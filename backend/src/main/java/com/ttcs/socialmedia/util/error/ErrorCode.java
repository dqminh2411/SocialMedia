package com.ttcs.socialmedia.util.error;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    SIGNUP_EXISTED_EMAIL(HttpStatus.BAD_REQUEST, "Email existed. Try another"),
    SIGNUP_UNMATCHED_PASSWORD(HttpStatus.BAD_REQUEST, "Confirm password does not match. Retry"),
    REFRESHTOKEN_INVALID(HttpStatus.BAD_REQUEST, "Invalid Refresh token"),
    REFRESHTOKEN_NOTFOUND(HttpStatus.BAD_REQUEST, "Refresh token not found"),
    LOGOUT_NO_USER_LOGGEDIN(HttpStatus.BAD_REQUEST, "No User Logged in"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User Not Found"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Access denied! You don't have privileges to access this resources"),
    CHAT_EXISTED(HttpStatus.BAD_REQUEST, "Chat already existed"),
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "Post not found!"),
    POST_LIKE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Post Like Failed"),
    POST_UNLIKE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Post Unlike Failed"),
    ROLE_NOT_EXISTED(HttpStatus.INTERNAL_SERVER_ERROR, "Role not existed")
    ;

    private HttpStatus status;
    private String message;

}
