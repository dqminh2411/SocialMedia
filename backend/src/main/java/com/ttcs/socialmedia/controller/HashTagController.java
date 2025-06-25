package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.Hashtag;
import com.ttcs.socialmedia.domain.dto.HashTagDTO;
import com.ttcs.socialmedia.service.HashtagService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/search")
    public ResponseEntity<?> searchHashtags(
            @RequestParam("query") String query,
            @RequestParam(value = "pageNo", defaultValue = "0") int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize) {
        Page<Hashtag> hashtags = hashtagService.searchHashtags(query, pageNo, pageSize);
        Map<String, Object> response = Map.of(
                "hashtags", hashtags.getContent().stream().map(hashtagService::hashtagToDTO).toList(),
                "pageNo", hashtags.getNumber() + 1,
                "totalPages", hashtags.getTotalPages(),
                "totalElements", hashtags.getTotalElements());
        return ResponseEntity.ok(response);
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
