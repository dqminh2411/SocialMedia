package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.RestResponse;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.ResSignupDTO;
import com.ttcs.socialmedia.domain.dto.SignupDTO;
import com.ttcs.socialmedia.service.UserService;
import com.ttcs.socialmedia.util.error.InvalidSignupException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    @PostMapping(value="/signup")
    public RestResponse<Object> signup(@Valid @RequestBody SignupDTO signupDTO) throws InvalidSignupException {
        if(signupDTO!=null){
            this.userService.createUser(signupDTO);
            RestResponse<Object> resp = new RestResponse<>();
            resp.setMessage("Đăng kí tài khoản thành công");
            resp.setStatusCode(HttpStatus.CREATED.value());
            return resp;
        }
        return null;
    }
    @GetMapping("/test")
    public RestResponse<Object> test() {
        RestResponse<Object> resp = new RestResponse<>();
        resp.setStatusCode(HttpStatus.OK.value());
        resp.setMessage("testok");
        return resp;
    }

}
