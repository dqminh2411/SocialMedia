package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.dto.NewPostDTO;
import com.ttcs.socialmedia.domain.dto.PostDTO;
import com.ttcs.socialmedia.service.PostService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@AllArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PostDTO createPost(@RequestPart("postText") String newPostJson,
            @RequestPart(value = "media") List<MultipartFile> media) throws URISyntaxException, IOException {
        return this.postService.createPost(newPostJson, media);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PostDTO updatePost(@PathVariable("id") int id,
            @RequestPart(value = "postText") String postJson,
            @RequestPart(value = "media") List<MultipartFile> media,
            @RequestPart(value = "mediaToDelete", required = false) String mediaToDeleteJson)
            throws URISyntaxException, IOException {
        return this.postService.updatePost(id, postJson, mediaToDeleteJson, media);
    }
}
