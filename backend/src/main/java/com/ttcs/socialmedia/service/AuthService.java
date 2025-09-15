package com.ttcs.socialmedia.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.ttcs.socialmedia.domain.Profile;
import com.ttcs.socialmedia.domain.Role;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.LoginDTO;
import com.ttcs.socialmedia.domain.dto.ResLoginDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.repository.ProfileRepository;
import com.ttcs.socialmedia.repository.RoleRepository;
import com.ttcs.socialmedia.repository.UserRepository;
import com.ttcs.socialmedia.util.SecurityUtil;
import com.ttcs.socialmedia.util.constants.AuthProvider;
import com.ttcs.socialmedia.util.constants.RoleEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String googleRedirectUri;

    @Value("${spring.security.oauth2.client.provider.google.user-info-uri}")
    private String googleUserInfoUri;

    @Value("${app.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    @Value("${default_avatar_url}")
    private String defaultAvatarUrl;

    private final UserService userService;
    private final SecurityUtil securityUtil;
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private RoleRepository roleRepository;

    public Map<String,Object> login(LoginDTO loginUser){
        ResLoginDTO resLoginDTO = new ResLoginDTO();
        if(loginUser.getProvider().equals("LOCAL")){
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    loginUser.getEmail(), loginUser.getPassword());
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        // get user info
        User user = this.userService.getUserByEmail(loginUser.getEmail());
        UserDTO userDTO = this.userService.userToUserDTO(user);
        resLoginDTO.setUserDTO(userDTO);

        // create access token
        String accessToken = this.securityUtil.createAccessToken(userDTO);
        resLoginDTO.setAccessToken(accessToken);

        // create refresh token

        String refreshToken = this.securityUtil.createRefreshToken(resLoginDTO);
        this.userService.updateRefreshToken(loginUser.getEmail(), refreshToken);
        // attach refresh token to cookie
        ResponseCookie resCookie = ResponseCookie.from("refreshToken",refreshToken).httpOnly(true).path("/").maxAge(refreshTokenExpiration).build();

        return Map.of("resLoginDTO", resLoginDTO, "resCookie", resCookie);

    }

    public String generateLoginUrl(String loginType){

            // Get Google's client registration
            ClientRegistration registration = clientRegistrationRepository.findByRegistrationId(loginType);


            // Build redirect URI
            String redirectUri = UriComponentsBuilder.fromUriString(registration.getRedirectUri())
                    .build()
                    .toUriString();

            // Build the full authorization URI
            String authorizationUri = UriComponentsBuilder
                    .fromUriString(registration.getProviderDetails().getAuthorizationUri())
                    .queryParam("client_id", registration.getClientId())
                    .queryParam("redirect_uri", redirectUri)
                    .queryParam("response_type", "code")
                    .queryParam("scope", String.join("%20", registration.getScopes()))
                    .queryParam("state", UUID.randomUUID().toString()) // Optional: generate a real CSRF token
                    .build(true)
                    .toUriString();

            return authorizationUri;

    }

    public Map<String, Object> authenticateAndGetProfile(String code, String loginType) throws IOException {

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory());

        String accTok = "";

        switch(loginType.toUpperCase()){
            case "GOOGLE":
                accTok = new GoogleAuthorizationCodeTokenRequest(
                        new NetHttpTransport(), new GsonFactory(),
                        googleClientId, googleClientSecret,code,googleRedirectUri
                ).execute().getAccessToken();
                final String accessToken = accTok;

                // include access token in Authorization header
                restTemplate.getInterceptors().add((req,body, executionContext)->{
                    req.getHeaders().set("Authorization", "Bearer " + accessToken);
                    return executionContext.execute(req,body);
                });

                // call user info api
                Map<String,Object> userInfo =  new ObjectMapper().readValue(
                        restTemplate.getForEntity(googleUserInfoUri,String.class).getBody(),
                        new TypeReference<Map<String, Object>>(){}
                );
                
                // get or create new user using google login
                String email = userInfo.get("email").toString();
                User user = userService.getUserByEmail(email);
                String providerId = (String) userInfo.get("sub");

                String fullname = (String) userInfo.get("name");
                if (user != null) {
                    // check if user uses the right provider to login
                    if(!user.getProvider().name().equals(loginType.toUpperCase())){
                        throw new OAuth2AuthenticationException("Invalid Provider");
                    }
                }else{
                    // create new user
                    user = new User();
                    user.setEmail(email);
                    user.setFullname(fullname);
                    user.setProviderId(providerId);
                    user.setProvider(AuthProvider.valueOf(loginType.toUpperCase()));
                    user.setUsername(email.substring(0, email.indexOf("@")));
                    Role role = roleRepository.findByName(RoleEnum.USER.name());
                    user.setRole(role);

                    user = userRepository.save(user);

                    //create profile
                    Profile profile = new Profile();
                    profile.setAvatar(defaultAvatarUrl);
                    profile.setUser(user);
                    profileRepository.save(profile);
                }

                return userInfo;
        }
        return new HashMap<>();

    }
}
