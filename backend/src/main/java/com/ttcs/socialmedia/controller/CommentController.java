package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.dto.CommentDTO;
import com.ttcs.socialmedia.service.CommentService;
import com.ttcs.socialmedia.util.SecurityUtil;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@AllArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("")
    public List<CommentDTO> getCommentPage(@RequestParam("postId") int postId, @RequestParam("pageNo") int pageNo) {
        return commentService.getCommentPage(postId, pageNo-1);
    }

    // create an api to add a comment
    @PostMapping("")
    public CommentDTO addComment(@RequestBody CommentDTO commentDTO) {
        String email = SecurityUtil.getCurrentUserLogin().get();
        return this.commentService.addComment(commentDTO, email);
    }
    @PutMapping("/{commentId}")
    public CommentDTO updateComment(@PathVariable int commentId, @RequestBody CommentDTO commentDTO) {
        return commentService.updateComment(commentId, commentDTO);
    }
    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable int commentId) {
        commentService.deleteComment(commentId);
    }

    @GetMapping("/{commentId}/replies")
    public List<CommentDTO> getRepliesPage(@PathVariable int commentId, @RequestParam("pageNo") int pageNo) {
        return commentService.getRepliesByCommentId(commentId, pageNo-1);
    }

    // create api to add replies to comment
    @PostMapping("/{commentId}/replies")
    public CommentDTO addReply(@PathVariable int commentId, @RequestBody CommentDTO commentDTO) {
        return commentService.addReply(commentId, commentDTO);
    }

}
