package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component(value="userDetailsService")
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    public CustomUserDetailsService(UserRepository userRepository) {

        this.userRepository=userRepository;
    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.ttcs.socialmedia.domain.User user = this.userRepository.findByEmail(username);
        if (user == null) {
            throw new UsernameNotFoundException("Email/Password không hợp lệ");
        }
        return new User(user.getEmail(), user.getHashedPassword() == null? "":user.getHashedPassword(), Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole())));
    }
}
