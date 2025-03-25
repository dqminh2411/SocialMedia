package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.ResSignupDTO;
import com.ttcs.socialmedia.domain.dto.SignupDTO;
import com.ttcs.socialmedia.repository.UserRepository;
import com.ttcs.socialmedia.util.constants.Role;
import com.ttcs.socialmedia.util.error.InvalidSignupException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    public void createUser(SignupDTO signupDTO) throws InvalidSignupException {
        if(this.userRepository.existsByEmail(signupDTO.getEmail())){
            throw new InvalidSignupException("Email đã tồn tại. Hãy dùng email khác");
        }
        else if(!signupDTO.getPassword().equals(signupDTO.getRePassword())){
            throw new InvalidSignupException("Mật khẩu nhập lại không khớp. Hãy thử lại");
        }

        User newUser = new User();
        newUser.setEmail(signupDTO.getEmail());
        newUser.setFullname(signupDTO.getFullname());
        newUser.setRole(Role.USER);
        newUser.setHashedPassword(passwordEncoder.encode(signupDTO.getPassword()));
        userRepository.save(newUser);
    }
    public User getUserByEmail(String email){
        return this.userRepository.findByEmail(email);
    }
    public void updateRefreshToken(String email, String refreshToken){
        User user = this.userRepository.findByEmail(email);
        if(user != null){
            user.setRefreshToken(refreshToken);
            userRepository.save(user);
        }
    }
    public User getUserByEmailAndRefreshToken(String email, String refreshToken){
        return this.userRepository.findByEmailAndRefreshToken(email, refreshToken);
    }
}
