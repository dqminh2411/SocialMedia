package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.RestResponse;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.ResProfileDTO;
import com.ttcs.socialmedia.domain.dto.SignupDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.service.FileService;
import com.ttcs.socialmedia.service.ProfileService;
import com.ttcs.socialmedia.service.UserService;
import com.ttcs.socialmedia.util.error.InvalidSignupException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private final ProfileService profileService;
    private final FileService fileService;

    @PostMapping(value = "/signup")
    public RestResponse<Object> signup(@Valid @RequestBody SignupDTO signupDTO) throws InvalidSignupException {
        if (signupDTO != null) {
            this.userService.createUser(signupDTO);
            return RestResponse.builder().statusCode(HttpStatus.CREATED.value()).message("Đăng kí tài khoản thành công").build();
        }
        return null;
    }

//    @PostMapping("/test")
//    public RestResponse<Object> test(@RequestParam("file") MultipartFile file) throws IOException, URISyntaxException {
//        fileService.deleteFile("https://res.cloudinary.com/dlz1eoryd/image/upload/v1750934198/socialMedia/avatars/upload-9072644940815940374c_kxfawo.jpg", "avatars");
//        RestResponse<Object> resp = new RestResponse<>();
//        resp.setStatusCode(HttpStatus.OK.value());
//        resp.setMessage("testok");
//        return resp;
//    }

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
