package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.RestResponse;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.ResProfileDTO;
import com.ttcs.socialmedia.domain.dto.SignupDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.service.ProfileService;
import com.ttcs.socialmedia.service.UserService;
import com.ttcs.socialmedia.util.error.InvalidSignupException;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    private final ProfileService profileService;

    public UserController(UserService userService, ProfileService profileService) {
        this.userService = userService;
        this.profileService = profileService;
    }

    @PostMapping(value = "/signup")
    public RestResponse<Object> signup(@Valid @RequestBody SignupDTO signupDTO) throws InvalidSignupException {
        if (signupDTO != null) {
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

    @PutMapping("/profile/update")
    public ResProfileDTO updateProfile(@RequestParam("userId") int userId,
            @RequestParam(name = "avatar", required = false) MultipartFile avatarFile,
            @RequestParam(name = "bio", required = false) String bio) {
        return this.profileService.update(userId, avatarFile, bio);
    }

    @GetMapping("/suggestions")
    public List<UserDTO> getSuggestions(@RequestParam("userId") int userId,
            @RequestParam(name = "pageNo", defaultValue = "0") int pageNo) {
        return this.userService.getSuggestions(userId, pageNo);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam("username") String username,
            @RequestParam(name = "pageNo", defaultValue = "1") int pageNo) {
        Page<User> userPage = this.userService.searchUsersByUsername(username, pageNo - 1);
        if (userPage == null || userPage.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        Map<String, Object> response = Map.of(
                "totalPages", userPage.getTotalPages(),
                "totalElements", userPage.getTotalElements(),
                "currentPage", userPage.getNumber() + 1,
                "users", userPage.getContent().stream()
                        .map(userService::userToUserDTO)
                        .collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }
}
