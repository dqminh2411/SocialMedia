package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.dto.FollowDTO;
import com.ttcs.socialmedia.service.FollowService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
public class FollowController {
    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("")
    public void follow(@RequestBody FollowDTO followDTO) {
        followService.createFollow(followDTO);
    }

    @PutMapping("/{followId}")
    public void confirmFollow(@PathVariable("followId") int followId) {
        followService.confirmFollow(followId);
    }
    @DeleteMapping("/{followId}")
    public void deleteFollow(@PathVariable("followId") int followId) {
        followService.deleteFollow(followId);
    }
}
