package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.Post;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.DetailPostDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.service.*;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URISyntaxException;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AdminController {
    private final UserService userService;
    private final PostService postService;
    private final CommentService commentService;
    private final ChatService chatService;
    private final HashtagService hashtagService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = Map.of(
                "totalUsers", userService.getTotalUserCount(),
                "totalPosts", postService.getTotalPostCount(),
                "totalComments", commentService.getTotalCommentCount(),
                "totalChats", chatService.getTotalChatCount(),
                "totalPostLikes", postService.getTotalPostLikesCount(),
                "totalHashtags", hashtagService.getTotalHashtagsCount());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userService.findUsersWithPagination(pageable, search);
        Page<UserDTO> userDTOs = userPage.map(user -> userService.userToUserDTO(user));
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable int id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userService.userToUserDTO(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable int id, @RequestBody UserDTO userDTO) {
        User updatedUser = userService.updateUserByAdmin(id, userDTO);
        if (updatedUser == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        boolean deleted = userService.deleteUser(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size,Sort.by("createdAt").descending());
        Page<Post> postPage = postService.findPostsWithPagination(pageable, search);
        Page<DetailPostDTO> postDTOs = postPage.map(postService::postToDetailDTO);
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPostById(@PathVariable int id) {
        Post post = postService.findById(id);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(postService.postToDetailDTO(post));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable int id) throws URISyntaxException {
        boolean deleted = postService.deletePost(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }
}
