package com.ttcs.socialmedia.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendEmail(){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("doanminhyb04@gmail.com");
        message.setSubject("hello world");
        message.setText("Hi there!");

        mailSender.send(message);
    }
    public void sendEmailVerificationCode(String email){
        // six-digit code
        Random rand = new Random();
        int code = 100000 + rand.nextInt(900000);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Outstagram email verification code");
        message.setText("This is your verification code to reset password: " + code);
        mailSender.send(message);
    }
}
