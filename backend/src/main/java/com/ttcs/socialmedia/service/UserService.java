package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Profile;
import com.ttcs.socialmedia.domain.Role;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.ResSignupDTO;
import com.ttcs.socialmedia.domain.dto.SignupDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.repository.RoleRepository;
import com.ttcs.socialmedia.repository.UserRepository;
import com.ttcs.socialmedia.util.SecurityUtil;
import com.ttcs.socialmedia.util.constants.RoleEnum;
import com.ttcs.socialmedia.util.error.AppException;
import com.ttcs.socialmedia.util.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    @Value("${app.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    @Value("${default_avatar_url}")
    private String defaultAvatarUrl;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ResSignupDTO createUser(SignupDTO signupDTO) throws AppException {
        if (this.userRepository.existsByEmail(signupDTO.getEmail())) {
            throw new AppException(ErrorCode.SIGNUP_EXISTED_EMAIL);
        } else if (!signupDTO.getPassword().equals(signupDTO.getRePassword())) {
            throw new AppException(ErrorCode.SIGNUP_UNMATCHED_PASSWORD);
        }

        User newUser = new User();
        newUser.setEmail(signupDTO.getEmail());
        newUser.setFullname(signupDTO.getFullname());
        Role role = roleRepository.findByName(RoleEnum.USER.name());
        newUser.setRole(role);
        newUser.setHashedPassword(passwordEncoder.encode(signupDTO.getPassword()));
        if (newUser.getRole() != null && newUser.getRole().getName().equals(RoleEnum.USER.name())) {
            Profile profile = new Profile();
            profile.setAvatar(defaultAvatarUrl);
            profile.setBio("");
            newUser.setProfile(profile);
        } else {
            throw new AppException(ErrorCode.ROLE_NOT_EXISTED);
        }
        newUser = userRepository.save(newUser);
        return convertToResSignupDTO(newUser);
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
        userDTO.setCreatedAt(user.getCreatedAt());
        userDTO.setRole(user.getRole().getName());
        userDTO.setProvider(user.getProvider().name());
        Profile p = user.getProfile();
        if (p != null)
            userDTO.setAvatar(p.getAvatar());
        return userDTO;
    }

    public ResSignupDTO convertToResSignupDTO(User user){
        return ResSignupDTO.builder()
                .id(user.getId())
                .fullname(user.getFullname())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
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

    public int getTotalUserCount() {
        return (int) this.userRepository.count();
    }

    /**
     * Finds users with pagination and optional search functionality for admin
     * management
     * 
     * @param pageable Pagination information
     * @param search   Optional search query for username, email, or fullname
     * @return Page of User objects matching the search criteria
     */
    public Page<User> findUsersWithPagination(Pageable pageable, String search) {
        String currentEmail = SecurityUtil.getCurrentUserLogin().orElseThrow();
        if(search == null) search = "";
        return userRepository.findByUsernameOrEmailContainingIgnoreCase(currentEmail,search.trim(), pageable);
    }

    /**
     * Find a user by their ID
     * 
     * @param id The user ID to look for
     * @return The user or null if not found
     */
    public User findById(int id) {
        return userRepository.findById(id);
    }

    /**
     * Update a user by an admin
     * 
     * @param id      The ID of the user to update
     * @param userDTO The data to update the user with
     * @return The updated user or null if the user wasn't found
     */
    @Transactional
    public User updateUserByAdmin(int id, UserDTO userDTO) {
        User user = userRepository.findById(id);
        if (user == null) {
            return null;
        }

        // Update user fields
        if (userDTO.getUsername() != null && !userDTO.getUsername().trim().isEmpty()) {
            user.setUsername(userDTO.getUsername());
        }

        if (userDTO.getEmail() != null && !userDTO.getEmail().trim().isEmpty()) {
            user.setEmail(userDTO.getEmail());
        }

        if (userDTO.getFullname() != null) {
            user.setFullname(userDTO.getFullname());
        }
        if(userDTO.getRole() != null){
            Role role  = roleRepository.findByName(userDTO.getRole());
            user.setRole(role);
        }
        return userRepository.save(user);
    }

    /**
     * Delete a user by their ID
     * 
     * @param id The ID of the user to delete
     * @return true if the user was deleted, false if the user wasn't found
     */
    @Transactional
    public boolean deleteUser(int id) {
        User user = userRepository.findById(id);
        if (user == null) {
            return false;
        }
        userRepository.delete(user);
        return true;
    }


}
