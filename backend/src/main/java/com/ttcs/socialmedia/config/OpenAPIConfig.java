package com.ttcs.socialmedia.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {
    private String devUrl = "http://localhost:8080/";

    private SecurityScheme createAPIKeyScheme(){
        return new SecurityScheme().type(SecurityScheme.Type.HTTP).bearerFormat("JWT").scheme("Bearer");
    }

    @Bean
    public OpenAPI openAPI() {
        Server devServer = new Server();
        devServer.setUrl(devUrl);
        devServer.setDescription("Development Server URL");

        Contact contact = new Contact();
        contact.setEmail("doanminhyb04@gmail.com");

        License license = new License().name("MIT License").url("https://opensource.org/licenses/MIT");

        Info info = new Info().contact(contact).license(license).title("Social Media API Doc").version("1.0").description("Social Media API Doc");

        return new OpenAPI().addSecurityItem(new SecurityRequirement().addList("Bearer Authentication")).components(new Components().addSecuritySchemes("Bearer Authentication", createAPIKeyScheme())).info(info).servers(List.of(devServer));
    }


}
