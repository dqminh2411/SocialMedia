package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Profile;
import com.ttcs.socialmedia.domain.Role;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.ResSignupDTO;
import com.ttcs.socialmedia.domain.dto.SignupDTO;
import com.ttcs.socialmedia.repository.RoleRepository;
import com.ttcs.socialmedia.repository.UserRepository;
import com.ttcs.socialmedia.util.constants.RoleEnum;
import com.ttcs.socialmedia.util.error.AppException;
import com.ttcs.socialmedia.util.error.ErrorCode;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private SignupDTO signupDTO;
    private User user, savedUser;
    private Role role;
    private Profile profile;

    @Value("default_avatar_url")
    private String defaultAvatarUrl;
    @BeforeEach
    public void initData(){

        signupDTO = SignupDTO.builder()
                .email("user@gmail.com")
                .fullname("Minh")
                .password("12345678")
                .rePassword("12345678")
                .build();


        role = Role.builder()
                .name(RoleEnum.USER.name())
                .build();



        profile = Profile.builder()
                .bio("")
                .avatar(defaultAvatarUrl)
                .build();

        user = User.builder()
                .email(signupDTO.getEmail())
                .createdAt(Instant.now())
                .fullname(signupDTO.getFullname())
                .role(role)
                .profile(profile)
                .build();

        savedUser = User.builder()
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .id(1)
                .fullname(user.getFullname())
                .role(user.getRole())
                .profile(profile)
                .build();

    }
    @Test
    void createUser_success(){
        Mockito.when(userRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(roleRepository.findByName(Mockito.anyString())).thenReturn(role);
        Mockito.when(userRepository.save(Mockito.any())).thenReturn(savedUser);
        Mockito.when(passwordEncoder.encode(signupDTO.getPassword())).thenReturn("hashedPassword");
        ResSignupDTO res = userService.createUser(signupDTO);

        Assertions.assertEquals(savedUser.getId(), res.getId());
        Assertions.assertEquals(savedUser.getCreatedAt(),res.getCreatedAt());
        Assertions.assertEquals(savedUser.getEmail(), res.getEmail());
        Assertions.assertEquals(savedUser.getFullname(), res.getFullname());
    }
    @Test
    void createUser_existedEmail_fail(){
        Mockito.when(userRepository.existsByEmail(Mockito.anyString())).thenReturn(true);
        AppException ex = Assertions.assertThrows(AppException.class,
                () -> userService.createUser(signupDTO));
        Assertions.assertEquals( ErrorCode.SIGNUP_EXISTED_EMAIL, ex.getError());
    }

    @Test
    void createUser_passwordUnmatch_fail(){
        signupDTO.setRePassword("123456789");

        AppException ex = Assertions.assertThrows(AppException.class,
                () -> userService.createUser(signupDTO));
        Assertions.assertEquals( ErrorCode.SIGNUP_UNMATCHED_PASSWORD, ex.getError());

//        Mockito.verify(userRepository, Mockito.never())
//                .existsByEmail(Mockito.anyString());
//        Mockito.verify(userRepository, Mockito.never())
//                .save(Mockito.any());
    }

    @Test
    void createUser_nullRole_fail(){
        Mockito.when(roleRepository.findByName(Mockito.anyString())).thenReturn(null);
        Mockito.when(passwordEncoder.encode(signupDTO.getPassword())).thenReturn("hashedPassword");
        AppException ex = Assertions.assertThrows(AppException.class, () -> userService.createUser(signupDTO));
        Assertions.assertEquals(ErrorCode.ROLE_NOT_EXISTED, ex.getError());
    }

}
