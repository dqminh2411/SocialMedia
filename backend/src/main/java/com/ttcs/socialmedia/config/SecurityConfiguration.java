package com.ttcs.socialmedia.config;

import com.ttcs.socialmedia.repository.UserRepository;
import com.ttcs.socialmedia.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

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




    String[] whiteLists = {"/","/users/test", "/auth/login", "/auth/social-login", "/auth/social/callback", "/users/signup", "/auth/refresh", "/storage/**",
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
