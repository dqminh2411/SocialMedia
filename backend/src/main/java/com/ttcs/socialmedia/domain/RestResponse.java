package com.ttcs.socialmedia.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ttcs.socialmedia.util.error.ErrorCode;
import lombok.*;

import java.util.Optional;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RestResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private ErrorCode error;
    public static <T> RestResponse<T> ok(String message){
        return RestResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }
    public static <T> RestResponse<T> ok(String message, T data){
        return RestResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }
    public static <T> RestResponse<T> error(ErrorCode error){
        return RestResponse.<T>builder()
                .success(false)
                .error(error)
                .build();
    }
}
