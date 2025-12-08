package com.ttcs.socialmedia.util.error;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private ErrorCode error;
    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.error = errorCode;
    }
}
