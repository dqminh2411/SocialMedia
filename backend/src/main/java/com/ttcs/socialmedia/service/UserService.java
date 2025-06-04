package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Follow;
import com.ttcs.socialmedia.domain.Profile;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.SignupDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.repository.FollowRepository;
import com.ttcs.socialmedia.repository.UserRepository;
import com.ttcs.socialmedia.util.constants.Role;
import com.ttcs.socialmedia.util.error.InvalidSignupException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FollowRepository followRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            FollowRepository followRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.followRepository = followRepository;
    }

    public void createUser(SignupDTO signupDTO) throws InvalidSignupException {
        if (this.userRepository.existsByEmail(signupDTO.getEmail())) {
            throw new InvalidSignupException("Email đã tồn tại. Hãy dùng email khác");
        } else if (!signupDTO.getPassword().equals(signupDTO.getRePassword())) {
            throw new InvalidSignupException("Mật khẩu nhập lại không khớp. Hãy thử lại");
        }

        User newUser = new User();
        newUser.setEmail(signupDTO.getEmail());
        newUser.setFullname(signupDTO.getFullname());
        newUser.setRole(Role.USER);
        newUser.setHashedPassword(passwordEncoder.encode(signupDTO.getPassword()));
        if (newUser.getRole().equals(Role.USER)) {
            Profile profile = new Profile();
            profile.setAvatar("defaultAvatar.jpg");
            profile.setBio("");
            profile.setUser(newUser);
            newUser.setProfile(profile);
        } else {
            newUser.setProfile(null);
        }
        userRepository.save(newUser);
    }

    public User getUserByEmail(String email) {
        return this.userRepository.findByEmail(email);
    }

    public void updateRefreshToken(String email, String refreshToken) {
        User user = this.userRepository.findByEmail(email);
        if (user != null) {
            user.setRefreshToken(refreshToken);
            userRepository.save(user);
        }
    }

    public User getUserByEmailAndRefreshToken(String email, String refreshToken) {
        return this.userRepository.findByEmailAndRefreshToken(email, refreshToken);
    }

    public UserDTO userToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullname(user.getFullname());
        userDTO.setUsername(user.getUsername());
        Profile p = user.getProfile();
        if (p != null)
            userDTO.setAvatar(p.getAvatar());
        return userDTO;
    }

    public List<UserDTO> getSuggestions(int userId, int pageNo) {
        int pageSize = 10;
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<User> usersPage = this.userRepository.findUsersNotFollowed(userId, pageable);
        if (usersPage.getContent() == null || usersPage.getContent().isEmpty()) {
            return List.of(); // Return an empty list if no users are found
        }
        return usersPage.getContent().stream().map(this::userToUserDTO).toList();
    }

    public User getUserById(int id) {
        return this.userRepository.findById(id);
    }

    public Page<User> searchUsersByUsername(String username, int pageNo) {
        int pageSize = 10;
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        return this.userRepository.findByUsernameContainingIgnoreCase(username, pageable);
    }

}
