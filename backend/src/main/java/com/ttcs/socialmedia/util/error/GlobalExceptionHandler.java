package com.ttcs.socialmedia.util.error;

import com.ttcs.socialmedia.domain.RestResponse;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // login exception
    @ExceptionHandler({UsernameNotFoundException.class, BadCredentialsException.class})
    public ResponseEntity<RestResponse<Object>> handleBadCredentialsException(Exception exception) {
        RestResponse<Object> response = new RestResponse<>();
        response.setStatusCode(HttpStatus.BAD_REQUEST.value());
        response.setMessage(exception.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RestResponse<Object>> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException methodArgumentNotValidException) {
        RestResponse<Object> response = new RestResponse<>();

        BindingResult bindRes = methodArgumentNotValidException.getBindingResult();
        response.setStatusCode(HttpStatus.BAD_REQUEST.value());

        List<FieldError> fieldErr = bindRes.getFieldErrors();
        List<String> errs = fieldErr.stream().map(DefaultMessageSourceResolvable::getDefaultMessage).toList();
        response.setMessage(errs.isEmpty() ? "" : errs.get(0));
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(value = {
            NoResourceFoundException.class,
    })
    public ResponseEntity<RestResponse<Object>> handleNotFoundException(Exception ex) {
        RestResponse<Object> res = new RestResponse<Object>();
        res.setStatusCode(HttpStatus.NOT_FOUND.value());
//        res.setError(ex.getMessage());
        res.setMessage("404 Not Found. URL may not exist...");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<RestResponse<Object>> handleAppException(AppException exception) {
        return ResponseEntity
                .status(exception.getError().getStatus())
                .body(RestResponse.builder()
                        .statusCode(exception.getError().getStatus().value())
                        .message(exception.getMessage())
                        .build());
    }
}
