package com.ttcs.socialmedia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

//@SpringBootApplication (exclude= {SecurityAutoConfiguration.class, ManagementWebSecurityAutoConfiguration.class})
@SpringBootApplication
@RestController
public class SocialmediaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SocialmediaApplication.class, args);
	}
	@GetMapping("/")
	public String home() {
		return "Hello World";
	}
}
