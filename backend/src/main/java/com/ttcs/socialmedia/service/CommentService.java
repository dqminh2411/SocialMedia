package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Comment;
import com.ttcs.socialmedia.domain.LikeComment;
import com.ttcs.socialmedia.domain.Post;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.CommentDTO;
import com.ttcs.socialmedia.repository.CommentRepository;
import com.ttcs.socialmedia.repository.LikeCommentRepository;
import com.ttcs.socialmedia.repository.PostRepository;
import com.ttcs.socialmedia.util.SecurityUtil;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserService userService;
    private final LikeCommentRepository likeCommentRepository;

    public List<CommentDTO> getCommentPage(int postId, int pageNo) {
        final int pageSize = 20;
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Post post = new Post();
        post.setId(postId);
        Page<Comment> commentsPage = commentRepository.findByPostOrderByCreatedAtDesc(post, pageable);
        List<Comment> comments = commentsPage.getContent();
        if (comments.isEmpty())
            return new ArrayList<>();
        return comments.stream().map(this::commentToCommentDTO).collect(Collectors.toList());
    }

    public CommentDTO commentToCommentDTO(Comment comment) {
        CommentDTO commentDTO = new CommentDTO();
        commentDTO.setId(comment.getId());
        commentDTO.setContent(comment.getContent());
        commentDTO.setUserDTO(userService.userToUserDTO(comment.getCreator()));
        commentDTO.setCreatedAt(comment.getCreatedAt());
        int parentId = comment.getParent() != null ? comment.getParent().getId() : 0;
        if (parentId != 0) {
            commentDTO.setParentId(parentId);
        }
        commentDTO.setLikes(likeCommentRepository.countByComment(comment));

        // Check if current user liked this comment
        String currentUserEmail = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (currentUserEmail != null) {
            User currentUser = userService.getUserByEmail(currentUserEmail);
            if (currentUser != null) {
                LikeComment likeComment = likeCommentRepository.findByCommentAndUser(comment, currentUser);
                commentDTO.setLikedByCurrentUser(likeComment != null);
            }
        }

        return commentDTO;
    }

    // create get replies method to get 20 comments by commentId and pageNo
    public List<CommentDTO> getRepliesByCommentId(int commentId, int pageNo) {
        final int pageSize = 20;
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Comment comment = new Comment();
        comment.setId(commentId);
        Page<Comment> commentsPage = commentRepository.findByParentOrderByCreatedAtDesc(comment, pageable);
        List<Comment> comments = commentsPage.getContent();
        if (comments.isEmpty())
            return new ArrayList<>();
        return comments.stream().map(this::commentToCommentDTO).collect(Collectors.toList());
    } // create add reply method to add reply to comment

    public CommentDTO addReply(int commentId, CommentDTO commentDTO) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        Comment parentComment = commentOptional.orElse(null);
        if (parentComment == null) {
            throw new RuntimeException("Parent comment not found");
        }
        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setParent(parentComment);
        String email = SecurityUtil.getCurrentUserLogin().get();
        User creator = userService.getUserByEmail(email);
        if (creator == null) {
            throw new RuntimeException("User not found");
        }
        comment.setCreator(creator);
        comment.setPost(parentComment.getPost());
        commentRepository.save(comment);
        return commentToCommentDTO(comment);
    }

    public CommentDTO addComment(CommentDTO commentDTO, String userEmail) {
        int postId = commentDTO.getPostId(); // Assuming CommentDTO has a getPostId() method
        Post post = postRepository.findById(postId);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }
        User user = userService.getUserByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setPost(post);
        comment.setCreator(user);
        comment = commentRepository.save(comment);
        return commentToCommentDTO(comment);
    }

    public CommentDTO updateComment(int commentId, CommentDTO commentDTO) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        Comment comment = commentOptional.isPresent() ? commentOptional.get() : null;
        if (comment == null)
            return null;
        comment.setContent(commentDTO.getContent());
        comment = commentRepository.save(comment);
        return commentToCommentDTO(comment);
    }

    public void deleteComment(int commentId) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isPresent()) {
            Comment comment = commentOptional.get();
            commentRepository.delete(comment);
        }
    }

    public void likeComment(int commentId, String email) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        Comment comment = commentOptional.orElse(null);
        if (comment == null) {
            throw new RuntimeException("Comment not found");
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Check if user already liked the comment
        LikeComment existingLike = likeCommentRepository.findByCommentAndUser(comment, user);

        if (existingLike != null) {
            // Unlike comment
            likeCommentRepository.delete(existingLike);
        } else {
            // Like comment
            LikeComment likeComment = new LikeComment();
            likeComment.setComment(comment);
            likeComment.setUser(user);
            likeCommentRepository.save(likeComment);
        }
    }

    public boolean isCommentLikedByUser(int commentId, String email) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        Comment comment = commentOptional.orElse(null);
        if (comment == null) {
            return false;
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            return false;
        }

        LikeComment existingLike = likeCommentRepository.findByCommentAndUser(comment, user);
        return existingLike != null;
    }

    public int getTotalCommentCount() {
        return (int) commentRepository.count();
    }
}
