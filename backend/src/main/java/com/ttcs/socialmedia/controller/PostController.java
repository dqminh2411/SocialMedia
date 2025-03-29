package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.dto.PostDTO;
import com.ttcs.socialmedia.service.PostService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;

@RestController
@RequestMapping("/posts")
@AllArgsConstructor
public class PostController {
    private final PostService postService;
    @PostMapping("/create")
    public PostDTO createPost(@RequestParam("creator_id") int creatorId,
                              @RequestParam("content") String content,
                              @RequestParam(value = "images", required = false) MultipartFile[] images
                              ) throws URISyntaxException, IOException {
        return this.postService.createPost(creatorId,content,images);
    }
}
