package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.dto.HashTagDTO;
import com.ttcs.socialmedia.service.HashtagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hashtags")
public class HashTagController {
    private final HashtagService hashtagService;

    public HashTagController(HashtagService hashtagService) {
        this.hashtagService = hashtagService;
    }

    @GetMapping
    public ResponseEntity<List<HashTagDTO>> getAllHashtags() {
        List<HashTagDTO> hashtags = hashtagService.getAllHashtagsDTO();
        return ResponseEntity.ok(hashtags);
    }

    // create api to get hashtag by id
    // create api to get hashtag by name
    // create api to get hashtag by post id
    // create api to get hashtag by user id
    // create api to get hashtag by comment id
    // create api to get hashtag by reply id
    // create api to get hashtag by story id
    // create api to get hashtag by story reply id
}
