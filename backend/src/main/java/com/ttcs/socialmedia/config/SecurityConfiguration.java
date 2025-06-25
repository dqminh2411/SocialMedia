package com.ttcs.socialmedia.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.util.Base64;
import com.ttcs.socialmedia.repository.UserRepository;
//import com.ttcs.socialmedia.service.CustomOauth2UserService;
import com.ttcs.socialmedia.service.UserService;
import com.ttcs.socialmedia.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
@RequiredArgsConstructor
public class SecurityConfiguration {


    private final UserRepository userRepository;
    private final UserService userService;


//    @Bean
//    public OAuth2UserService customOAuth2UserService(UserRepository userRepository, UserService userService){
//        return new CustomOauth2UserService(userRepository,userService);
//    }




    String[] whiteLists = {"/", "/auth/login", "/auth/social-login", "/auth/social/callback", "/users/signup", "/auth/refresh", "/storage/**",
            "/ws", "/actuator/**", "/swagger-ui.html", "/v3/api-docs/**", "/swagger-ui/**"};
    @Bean
    // , CustomAuthenticationEntryPoint customAuthenticationEntryPoint
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           CustomAuthenticationEntryPoint customAuthenticationEntryPoint) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable).cors(Customizer.withDefaults()).authorizeHttpRequests(
                authz -> authz.requestMatchers(whiteLists).permitAll().anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults())
                        .authenticationEntryPoint(customAuthenticationEntryPoint))
                // .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(new
                // BearerTokenAuthenticationEntryPoint()).accessDeniedHandler(new
                // BearerTokenAccessDeniedHandler()))
                .formLogin(AbstractHttpConfigurer::disable) // allow everyone to acesss login page
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));// change
        // default
        // session
        // CREATION
        // Policy;

        return http.build();
    }



}
