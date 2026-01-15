package com.ttcs.socialmedia.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ttcs.socialmedia.domain.dto.ResSignupDTO;
import com.ttcs.socialmedia.domain.dto.SignupDTO;
import com.ttcs.socialmedia.service.UserService;
import com.ttcs.socialmedia.util.error.AppException;
import com.ttcs.socialmedia.util.error.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;

@Slf4j
@SpringBootTest // init spring boot app, beans,... to test => this class can be run without the whole app initization
@AutoConfigureMockMvc // create a mock request to controller

public class UserControllerTest {

    @Autowired
    // create mock request
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    private SignupDTO signupDTO;
    private ResSignupDTO resSignupDTO;
    private final String URI = "/api/v1/users";
    @BeforeEach
    public void initData(){

        signupDTO = SignupDTO.builder()
                .email("user@gmail.com")
                .fullname("Minh")
                .password("12345678")
                .rePassword("12345678")
                .build();

        resSignupDTO = ResSignupDTO.builder()
                .id(1)
                .createdAt(Instant.now())
                .email("user@gmail.com")
                .fullname("Minh")
                .build();

    }

    @Test
    void signup_validRequest_success() throws Exception{
        //GIVEN
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        String reqContent = mapper.writeValueAsString(signupDTO);

        // mock userservice
        Mockito.when(userService.createUser(ArgumentMatchers.any()))
                .thenReturn(resSignupDTO);

        // mock api request
        // this test method relies on api URI and HTTP method to determine which controller's method it tests
        mockMvc.perform(MockMvcRequestBuilders.post(URI)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(reqContent))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("success").value(true))
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Sign up successfully"))
                .andExpect(MockMvcResultMatchers.jsonPath("data.id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("data.email").value("user@gmail.com"));
    }
    // test validation

    @Test
    void signup_invalidEmail_fail() throws Exception{
        signupDTO.setEmail("myemail.com");
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        String reqContent = mapper.writeValueAsString(signupDTO);

        mockMvc.perform(MockMvcRequestBuilders.post(URI)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(reqContent))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("success").value(false))
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Email không hợp lệ"));
    }

    @Test
    // test existed email
    void signup_existedEmail_fail() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        String reqContent = mapper.writeValueAsString(signupDTO);

        // throw existed email exception
        Mockito.when(userService.createUser(Mockito.any()))
                        .thenThrow(new AppException(ErrorCode.SIGNUP_EXISTED_EMAIL));

        mockMvc.perform(MockMvcRequestBuilders.post(URI)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(reqContent))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("success").value(false))
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Email existed. Try another"))
                .andExpect(MockMvcResultMatchers.jsonPath("error").value("SIGNUP_EXISTED_EMAIL"));
    }

    @Test
    // test auth headers
    void searchUsers_noAuthHeader_fail() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        String reqContent = mapper.writeValueAsString(signupDTO);

        mockMvc.perform(MockMvcRequestBuilders.get(URI)
                        .param("username", "user")
                        .param("pageNo","1"))
                .andExpect(MockMvcResultMatchers.status().is(401))
                .andExpect(MockMvcResultMatchers.jsonPath("success").value(false))
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Full authentication is required to access this resource"));
    }
}
