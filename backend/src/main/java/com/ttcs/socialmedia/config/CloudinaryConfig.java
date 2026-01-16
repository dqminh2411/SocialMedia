package com.ttcs.socialmedia.config;

import com.cloudinary.Cloudinary;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${CLOUDINARY_URL}")
    private String CLOUDINARY_URL;
    @Bean
    public Cloudinary cloudinary() {
        // Set your Cloudinary credentials
        Cloudinary cloudinary = new Cloudinary(CLOUDINARY_URL);
        //System.out.println(cloudinary.config.cloudName);
        return cloudinary;
    }

}
