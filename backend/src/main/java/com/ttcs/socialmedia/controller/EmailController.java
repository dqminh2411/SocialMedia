package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;
    @GetMapping("")
    public void email() {
        emailService.sendEmail();
    }
}
