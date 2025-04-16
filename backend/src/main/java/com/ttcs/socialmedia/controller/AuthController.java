package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.LoginDTO;
import com.ttcs.socialmedia.domain.dto.ResLoginDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.service.UserService;
import com.ttcs.socialmedia.util.SecurityUtil;
import com.ttcs.socialmedia.util.annotation.ApiMessage;
import com.ttcs.socialmedia.util.error.AuthException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final SecurityUtil securityUtil;
    private final UserService userService;

    @Value("${app.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    public AuthController(AuthenticationManagerBuilder authenticationManagerBuilder, SecurityUtil securityUtil, UserService userService) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityUtil = securityUtil;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ResLoginDTO> login(@Valid @RequestBody LoginDTO loginUser) {
        ResLoginDTO resLoginDTO = new ResLoginDTO();
        if (loginUser != null) {
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    loginUser.getEmail(), loginUser.getPassword());
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);


            // get user info
            User user = this.userService.getUserByEmail(loginUser.getEmail());
            UserDTO userDTO = userService.userToUserDTO(user);
            resLoginDTO.setUserDTO(userDTO);

            // create access token
            String accessToken = this.securityUtil.createAccessToken(userDTO);
            resLoginDTO.setAccessToken(accessToken);



            // create refresh token

            String refreshToken = this.securityUtil.createRefreshToken(resLoginDTO);
            this.userService.updateRefreshToken(loginUser.getEmail(), refreshToken);
            // attach refresh token to cookie
            ResponseCookie resCookie = ResponseCookie.from("refreshToken",refreshToken).httpOnly(true).path("/").maxAge(refreshTokenExpiration).build();
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, resCookie.toString()).body(resLoginDTO);
        }
        return null;
    }
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


    @GetMapping("/refresh")
    public ResponseEntity<ResLoginDTO> refreshAccessToken(@CookieValue(name = "refreshToken",defaultValue = "defaultRefreshToken") String refreshToken) throws AuthException {

        // check if cookie is passed to server or not
        if(refreshToken.equals("defaultRefreshToken")){
            throw new AuthException("Không có Refresh Token trong cookies");
        }
        // check valid refresh token
        Jwt decodedToken = this.securityUtil.checkRefreshToken(refreshToken);
        String email = decodedToken.getSubject();

        // check user and refresh token
        // guarantee that the refresh token is the newest version
        User user = this.userService.getUserByEmailAndRefreshToken(email,refreshToken);
        if(user == null){
            throw new AuthException("User/RefreshToken không hợp lệ");
        }

        // create resLoginDTO,

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
    public ResponseEntity<Void> logout() throws AuthException{
        String email = SecurityUtil.getCurrentUserLogin().isPresent()? SecurityUtil.getCurrentUserLogin().get() : "";
        if(email.isEmpty())
            throw new AuthException("Người dùng đang không đăng nhập");
        // update user's refresh token
        this.userService.updateRefreshToken(email,null);
        // update cookie
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken",null).path("/").httpOnly(true).secure(true).maxAge(0).build();

        // set authentication in security context holder
//        SecurityContextHolder.getContext();
//        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString()).build();

    }
}
