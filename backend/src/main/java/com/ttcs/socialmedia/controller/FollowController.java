package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.FollowDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.service.FollowService;
import com.ttcs.socialmedia.service.UserService;

import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
@AllArgsConstructor
public class FollowController {
    private final FollowService followService;
    private final UserService userService;

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

    @GetMapping("/check")
    public ResponseEntity<?> checkFollowStatus(@RequestParam("followingUserId") int followingUserId,
            @RequestParam("followedUserId") int followedUserId) {
        String status = followService.checkFollowStatus(followingUserId, followedUserId);
        if (status == null) {
            status = "NOT_REQUESTED";
        }
        Map<String, String> response = Map.of(
                "followStatus", status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<?> getUserFollowers(
            @PathVariable int userId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<User> followersPage = followService.getUserFollowers(userId, query, page, size);
        if (followersPage == null || followersPage.isEmpty()) {
            return ResponseEntity
                    .ok(Map.of("users", List.of(), "totalPages", 0, "totalElements", 0, "currentPage", page));
        }
        return ResponseEntity
                .ok(Map.of("users", followersPage.getContent().stream().map(userService::userToUserDTO).toList(),
                        "totalPages", followersPage.getTotalPages(), "totalElements", followersPage.getTotalElements(),
                        "currentPage", followersPage.getNumber()));
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<?> getUserFollowing(
            @PathVariable int userId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<User> followingsPage = followService.getUserFollowings(userId, query, page, size);
        if (followingsPage == null || followingsPage.isEmpty()) {
            return ResponseEntity
                    .ok(Map.of("users", List.of(), "totalPages", 0, "totalElements", 0, "currentPage", page));
        }
        return ResponseEntity
                .ok(Map.of("users", followingsPage.getContent().stream().map(userService::userToUserDTO).toList(),
                        "totalPages", followingsPage.getTotalPages(), "totalElements",
                        followingsPage.getTotalElements(), "currentPage", followingsPage.getNumber()));
    }
}
