package com.ttcs.socialmedia.util.error;

import com.ttcs.socialmedia.domain.RestResponse;
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
        response.setError("Bad Credentials");
        response.setMessage("Email/password không hợp lệ");
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RestResponse<Object>> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException methodArgumentNotValidException) {
        RestResponse<Object> response = new RestResponse<>();
        // List<ObjectError> errors = methodArgumentNotValidException.getAllErrors();
        // List<String> errorMsgs = new ArrayList<>();
        // for (ObjectError e : errors) {
        // errorMsgs.add(e.getDefaultMessage());
        // }
        // response.setStatusCode(HttpStatus.BAD_REQUEST.value());
        // response.setMessage(errorMsgs);
        // response.setError("Đăng nhập ko thành công");

        BindingResult bindRes = methodArgumentNotValidException.getBindingResult();
        response.setStatusCode(HttpStatus.BAD_REQUEST.value());
        response.setError(methodArgumentNotValidException.getBody().getDetail());

        List<FieldError> fieldErr = bindRes.getFieldErrors();
        List<String> errs = fieldErr.stream().map(e -> e.getDefaultMessage()).collect(Collectors.toList());
        response.setMessage(errs.size() > 1 ? errs : errs.get(0));
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(InvalidSignupException.class)
    public ResponseEntity<RestResponse<Object>> handleInvalidSignupException(InvalidSignupException exception) {
        RestResponse<Object> response = new RestResponse<>();
        response.setStatusCode(HttpStatus.BAD_REQUEST.value());
        response.setError("Invalid Signup Exception");
        response.setMessage(exception.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
    @ExceptionHandler(value = {
            NoResourceFoundException.class,
    })
    public ResponseEntity<RestResponse<Object>> handleNotFoundException(Exception ex) {
        RestResponse<Object> res = new RestResponse<Object>();
        res.setStatusCode(HttpStatus.NOT_FOUND.value());
        res.setError(ex.getMessage());
        res.setMessage("404 Not Found. URL may not exist...");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
    }
//    @ExceptionHandler(InvalidIdException.class)
//    public ResponseEntity<RestResponse<Object>> handleInvalidIdException(InvalidIdException exception) {
//        RestResponse<Object> response = new RestResponse<>();
//        response.setStatusCode(HttpStatus.BAD_REQUEST.value());
//        response.setError(exception.getMessage());
//        response.setMessage("id khong hop le");
//        return ResponseEntity.badRequest().body(response);
//    }
}
