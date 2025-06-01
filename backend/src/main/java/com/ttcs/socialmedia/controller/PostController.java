package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.Post;
import com.ttcs.socialmedia.domain.dto.DetailPostDTO;
import com.ttcs.socialmedia.domain.dto.PostDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.service.CommentService;
import com.ttcs.socialmedia.service.PostService;
import com.ttcs.socialmedia.util.SecurityUtil;

import io.micrometer.core.ipc.http.HttpSender.Response;
import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@AllArgsConstructor
public class PostController {
    private final PostService postService;
    private final CommentService commentService;

    @GetMapping("/{id}")
    public DetailPostDTO getPostById(@PathVariable("id") int postId) {
        return this.postService.getPostDetailById(postId);
    }

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

    @GetMapping("")
    public List<PostDTO> getUserPostPage(@RequestParam("userId") int userId, @RequestParam("pageNo") int pageNo) {
        return postService.getUserPostPage(userId, pageNo - 1);
    }

    @GetMapping("/{id}/likes")
    public List<UserDTO> getLikePage(@PathVariable("id") int postId, @RequestParam("pageNo") int pageNo) {
        return postService.getLikePage(postId, pageNo - 1);
    }

    @PostMapping("{id}/like")
    public void likePost(@PathVariable("id") int postId) {
        String email = SecurityUtil.getCurrentUserLogin().get();
        this.postService.likePost(postId, email);
    }

    @GetMapping("/explore")
    public ResponseEntity<?> getPostsFromUnfollowedUsers(
            @RequestParam(name = "pageNo", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        Page<Post> postsPage = postService.getPostsFromUnfollowedUsers(page, size);
        List<PostDTO> postDTOs = postsPage.getContent().stream()
                .map(post -> postService.postToDTO(post))
                .toList();
        Map<String, Object> response = Map.of(
                "posts", postDTOs,
                "totalPages", postsPage.getTotalPages(),
                "currentPage", postsPage.getNumber(),
                "totalElements", postsPage.getTotalElements());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/home")
    public ResponseEntity<?> getHomePosts(@RequestParam(name = "pageNo", defaultValue = "0") int page) {

        Page<Post> postsPage = postService.getHomePosts(page);
        List<DetailPostDTO> postDTOs = postsPage.getContent().stream()
                .map(post -> postService.postToDetailDTO(post))
                .toList();
        Map<String, Object> response = Map.of(
                "posts", postDTOs,
                "totalPages", postsPage.getTotalPages(),
                "currentPage", postsPage.getNumber(),
                "totalElements", postsPage.getTotalElements());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/new-home")
    public ResponseEntity<?> getNewHomePosts(@RequestParam(name = "pageNo", defaultValue = "0") int page) {

        int pageSize = 10;
        Page<Post> postsPage = postService.getPostsFromUnfollowedUsers(page, pageSize);
        List<DetailPostDTO> postDTOs = postsPage.getContent().stream()
                .map(post -> postService.postToDetailDTO(post))
                .toList();
        Map<String, Object> response = Map.of(
                "posts", postDTOs,
                "totalPages", postsPage.getTotalPages(),
                "currentPage", postsPage.getNumber(),
                "totalElements", postsPage.getTotalElements());
        return ResponseEntity.ok(response);
    }
}
