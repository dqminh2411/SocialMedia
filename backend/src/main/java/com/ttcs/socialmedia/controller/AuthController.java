package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.LoginDTO;
import com.ttcs.socialmedia.domain.dto.ResLoginDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.service.AuthService;
import com.ttcs.socialmedia.service.EmailService;
import com.ttcs.socialmedia.service.UserService;
import com.ttcs.socialmedia.util.SecurityUtil;
import com.ttcs.socialmedia.util.annotation.ApiMessage;
import com.ttcs.socialmedia.util.error.AppException;
import com.ttcs.socialmedia.util.error.ErrorCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping(path = "${apiPrefix}/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;
    private final UserService userService;
    private final AuthService authService;
    @Value("${app.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;
    private final EmailService emailService;



    @PostMapping("/login")
    public ResponseEntity<ResLoginDTO> login(@Valid @RequestBody LoginDTO loginUser) {
        if (loginUser != null) {
            loginUser.setProvider("LOCAL");
            Map<String,Object> resp = authService.login(loginUser);
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            log.info("Email: {}", authentication.getName());
            authentication.getAuthorities().forEach(grantedAuthority -> log.info("Granted Authority: {}", grantedAuthority.getAuthority()));
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, resp.get("resCookie").toString()).body((ResLoginDTO)resp.get("resLoginDTO"));
        }
        return null;
    }

    @GetMapping("/social-login")
    public ResponseEntity<?> getSocialLoginUrl(@RequestParam("loginType") String loginType){
        Map<String, Object> resp = new HashMap<>();
        String loginUrl = authService.generateLoginUrl(loginType);
        resp.put("loginUrl", loginUrl);
        return ResponseEntity.ok().body(resp);
    }

    @PostMapping("/social/callback")
    public ResponseEntity<?> callback(@RequestParam("code") String code, @RequestParam("loginType") String loginType) throws IOException {
        Map<String, Object> userInfo = authService.authenticateAndGetProfile(code, loginType);
        if(userInfo == null || userInfo.isEmpty()){
            return ResponseEntity.badRequest().body(Map.of("message", "Google user info authentication failed"));
        }

        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setEmail(userInfo.get("email").toString());
        loginDTO.setProvider(loginType.toUpperCase());
        loginDTO.setProviderId(userInfo.get("sub").toString());

        return this.login(loginDTO);
    };


    @GetMapping("/account")
    public ResponseEntity<UserDTO> getAccount(){
        String email = SecurityUtil.getCurrentUserLogin().isPresent()? SecurityUtil.getCurrentUserLogin().get() : "";
        if(!email.isEmpty()){
            User user = this.userService.getUserByEmail(email);
            UserDTO userLogin = userService.userToUserDTO(user);
            return ResponseEntity.ok().body(userLogin);
        }
        return null;
    }


    @PostMapping("/refresh")
    public ResponseEntity<ResLoginDTO> refreshAccessToken(@CookieValue(name = "refreshToken",defaultValue = "defaultRefreshToken") String refreshToken) throws AppException {

        // check if cookie is passed to server or not
        if(refreshToken.equals("defaultRefreshToken")){
            throw new AppException(ErrorCode.REFRESHTOKEN_NOTFOUND);
        }
        // check valid refresh token
        Jwt decodedToken = this.securityUtil.checkRefreshToken(refreshToken);
        String email = decodedToken.getSubject();

        // check user and refresh token
        // guarantee that the refresh token is the newest version
        User user = this.userService.getUserByEmailAndRefreshToken(email,refreshToken);
        if(user == null){
            throw new AppException(ErrorCode.REFRESHTOKEN_INVALID);
        }

        // create resLoginDTO

        UserDTO userLogin = userService.userToUserDTO(user);
        ResLoginDTO resLoginDTO = new ResLoginDTO();
        resLoginDTO.setUserDTO(userLogin);

        // create new access token with userLogin
        String newAccessToken = this.securityUtil.createAccessToken(userLogin);
        resLoginDTO.setAccessToken(newAccessToken);

        // create new refresh token and update user's refresh token

        String newRefreshToken = this.securityUtil.createRefreshToken(resLoginDTO);
        this.userService.updateRefreshToken(email, newRefreshToken);

        // create refresh token cookie

        ResponseCookie resCookie = ResponseCookie.from("refreshToken", newRefreshToken).httpOnly(true).maxAge(this.refreshTokenExpiration).path("/").secure(true).build();
        //set cookie to Response
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, resCookie.toString()).body(resLoginDTO);

    }

    @PostMapping("/logout")
    @ApiMessage("Đăng xuất thành công")
    public ResponseEntity<Void> logout() throws AppException{
        String email = SecurityUtil.getCurrentUserLogin().isPresent()? SecurityUtil.getCurrentUserLogin().get() : "";
        if(email.isEmpty())
            throw new AppException(ErrorCode.LOGOUT_NO_USER_LOGGEDIN);
        // update user's refresh token
        this.userService.updateRefreshToken(email,null);
        // update cookie
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken",null).path("/").httpOnly(true).secure(true).maxAge(0).build();

        // set authentication in security context holder
//        SecurityContextHolder.getContext();
//        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString()).build();

    }
    @PostMapping("/forgot-password/email")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String,Object> body){
        String email = (String) body.get("email");
        emailService.sendEmailVerificationCode(email);
        return ResponseEntity.ok().build();
    }
}
