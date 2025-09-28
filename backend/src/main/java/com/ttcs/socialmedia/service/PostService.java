package com.ttcs.socialmedia.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ttcs.socialmedia.domain.*;
import com.ttcs.socialmedia.domain.dto.*;
import com.ttcs.socialmedia.repository.*;
import com.ttcs.socialmedia.util.SecurityUtil;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final FileService fileService;
    private final PostMediaRepository postMediaRepository;
    private final LikePostRepository likePostRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostMentionsRepository postMentionsRepository;
    private final HashtagRepository hashtagRepository;
    private final PostHashtagsRepository postHashtagsRepository;
    private final ObjectMapper objectMapper;
    private final UserService userService;
    private final CommentService commentService;

    public PostDTO getPostById(int postId) {
        Post post = postRepository.findById(postId);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }
        return postToDTO(post);
    }

    public Page<Post> getHomePosts(int page) {
        int pageSize = 10;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("createdAt").descending());
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
        User currentUser = userRepository.findByEmail(email);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }
        return postRepository.findPostsFromFollowedUsers(currentUser.getId(), pageable);
    }

    public PostDTO createPost(String newPostJson, List<MultipartFile> medias) throws URISyntaxException, IOException {
        Post post = new Post();
        // convert newPostJson to newPostDto

        NewPostDTO newPostDTO = objectMapper.readValue(newPostJson, NewPostDTO.class);

        // Determine creator from authenticated user, ignore any client-provided creatorId
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
        User currentUser = userRepository.findByEmail(email);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }
        post.setCreator(currentUser);
        post.setContent(newPostDTO.getContent());

        // set media
        List<PostMedia> postMediaList = new ArrayList<>();
        if (medias != null) {
            for (int i = 1; i <= medias.size(); i++) {
                PostMedia media = new PostMedia();
                media.setPost(post);
                media.setPosition(i);
                media.setFileName(fileService.upload(medias.get(i - 1), "posts"));
                postMediaList.add(media);
            }
        }
        post.setPostMedias(postMediaList);
        List<PostMentions> postMentions = new ArrayList<>();
        // set mentions
        List<String> mentions = newPostDTO.getMentions();
        if (mentions != null && !mentions.isEmpty()) {
            for (String m : mentions) {
                User mentionedUser = userRepository.findByUsername(m);
                if (mentionedUser != null) {
                    PostMentions postMention = new PostMentions();
                    postMention.setPost(post);
                    postMention.setUser(mentionedUser);
                    postMentions.add(postMention);
                }
            }
        }
        post.setPostMentions(postMentions);

        List<PostHashtags> postHashtags = new ArrayList<>();
        // set hashtags
        List<String> hashtags = newPostDTO.getHashtags();
        if (hashtags != null && !hashtags.isEmpty()) {
            for (String h : hashtags) {
                Hashtag hashtag = hashtagRepository.findByName(h);
                if (hashtag == null) {
                    hashtag = new Hashtag();
                    hashtag.setName(h);
                    hashtag = hashtagRepository.save(hashtag);
                }
                PostHashtags postHashtag = new PostHashtags();
                postHashtag.setHashtag(hashtag);
                postHashtag.setPost(post);
                postHashtags.add(postHashtag);
            }
        }
        post.setPostHashtags(postHashtags);
        // save post
        post = postRepository.save(post);
        return postToDTO(post);

    }

    public PostDTO updatePost(int id, String postJson, String mediasToDeleteJson, List<MultipartFile> newMedias)
            throws URISyntaxException, IOException {
        Post post = postRepository.findById(id);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }
        if(!checkOwner(post)){
            throw new RuntimeException("Current user not authorized");
        }
        if (mediasToDeleteJson == null) {
            mediasToDeleteJson = "[]"; // default to empty list if null
        }
        List<String> mediasToDelete = objectMapper.readValue(mediasToDeleteJson, new TypeReference<List<String>>() {
        });
        // convert postJson to newPostDto
        NewPostDTO newPostDTO = objectMapper.readValue(postJson, NewPostDTO.class);
        post.setContent(newPostDTO.getContent());
        // delete medias
        if (mediasToDelete != null && !mediasToDelete.isEmpty()) {
            // delete media from postMedia table and file system
            for (String mediaUrl : mediasToDelete) {
                String imgName = mediaUrl.substring(mediaUrl.lastIndexOf("/") + 1);
                PostMedia postMedia = postMediaRepository.findByFileName(imgName);
                if (postMedia != null) {
                    fileService.deleteFile(imgName, "posts");
                    postMediaRepository.delete(postMedia);
                }
            }
        }

        // update medias' positions
        List<PostMedia> postMedias = postMediaRepository.findByPost(post);
        int i = 1;
        for (PostMedia postMedia : postMedias) {
            postMedia.setPosition(i++);
            postMediaRepository.save(postMedia);
        }

        // insert new medias
        if (newMedias != null && newMedias.size() > 0) {
            for (MultipartFile media : newMedias) {
                PostMedia postMedia = new PostMedia();
                postMedia.setPost(post);
                postMedia.setFileName(fileService.upload(media, "posts"));
                postMedia.setPosition(i++);
                postMediaRepository.save(postMedia);
            }
        }

        // update mentions
        Set<String> newMentions = new HashSet<>(newPostDTO.getMentions());
        for (PostMentions postMention : post.getPostMentions()) {
            if (newMentions.contains(postMention.getUser().getUsername())) {
                newMentions.remove(postMention.getUser().getUsername());
            } else {
                postMentionsRepository.delete(postMention);
            }
        }

        for (String mention : newMentions) {
            User mentionedUser = userRepository.findByUsername(mention);
            if (mentionedUser != null) {
                PostMentions postMention = new PostMentions();
                postMention.setPost(post);
                postMention.setUser(mentionedUser);
                postMentionsRepository.save(postMention);
            }
        }

        // update hashtags
        Set<String> newHashtags = new HashSet<>(newPostDTO.getHashtags());
        for (PostHashtags postHashtag : post.getPostHashtags()) {
            if (newHashtags.contains(postHashtag.getHashtag().getName())) {
                newHashtags.remove(postHashtag.getHashtag().getName());
            } else {
                postHashtagsRepository.delete(postHashtag);
            }
        }
        for (String hashtag : newHashtags) {
            Hashtag hashtagEntity = hashtagRepository.findByName(hashtag);
            if (hashtagEntity == null) {
                hashtagEntity = new Hashtag();
                hashtagEntity.setName(hashtag);
                hashtagEntity = hashtagRepository.save(hashtagEntity);
            }
            PostHashtags postHashtag = new PostHashtags();
            postHashtag.setPost(post);
            postHashtag.setHashtag(hashtagEntity);
            postHashtagsRepository.save(postHashtag);
        }
        // update post

        // return updated post
        post = postRepository.save(post);
        return postToDTO(post);
    }

    public PostDTO postToDTO(Post post) {
        PostDTO postDTO = new PostDTO();
        postDTO.setId(post.getId());
        postDTO.setLikes(likePostRepository.countByPost(post));
        postDTO.setComments(commentRepository.countByPost(post));
        List<String> mediaList = postMediaRepository.findFileNamesByPostOrderByPositionAsc(post);
        postDTO.setFirstMediaName(mediaList.isEmpty() ? null : mediaList.get(0));
        return postDTO;
    }

    public DetailPostDTO postToDetailDTO(Post post) {
        DetailPostDTO detailPostDTO = new DetailPostDTO();
        detailPostDTO.setId(post.getId());
        detailPostDTO.setContent(post.getContent());
        detailPostDTO.setCreator(userService.userToUserDTO(post.getCreator()));
        detailPostDTO.setLikes(likePostRepository.countByPost(post));
        // Count comments
        detailPostDTO.setCommentsCount(post.getComments().size());
        detailPostDTO.setCreatedAt(post.getCreatedAt());
        detailPostDTO.setUpdatedAt(post.getUpdatedAt());

        // Convert post media
        List<PostMedia> postMediaList = post.getPostMedias();
        List<PostMediaDTO> mediaList = postMediaList.stream().map(media -> {
            PostMediaDTO mediaDTO = new PostMediaDTO();
            mediaDTO.setId(media.getId());
            mediaDTO.setFileName(media.getFileName());
            mediaDTO.setPosition(media.getPosition());
            return mediaDTO;
        }).collect(Collectors.toList());
        detailPostDTO.setMedia(mediaList);

        // Convert hashtags
        List<HashTagDTO> hashtagList = post.getPostHashtags().stream().map(postHashtag -> {
            Hashtag hashtag = postHashtag.getHashtag();
            return new HashTagDTO(hashtag);
        }).collect(Collectors.toList());
        detailPostDTO.setHashtags(hashtagList);

        // Convert mentions
        List<UserDTO> mentionsList = post.getPostMentions().stream()
                .map(mention -> userService.userToUserDTO(mention.getUser()))
                .collect(Collectors.toList());
        detailPostDTO.setMentions(mentionsList);

        // Get first page of comments
        List<CommentDTO> comments = commentService.getCommentPage(post.getId(), 0);
        detailPostDTO.setComments(comments);

        // Check if current user liked the post
        String currentUserEmail = com.ttcs.socialmedia.util.SecurityUtil.getCurrentUserLogin().orElse(null);
        if (currentUserEmail != null) {
            User currentUser = userRepository.findByEmail(currentUserEmail);
            boolean liked = post.getLikePosts().stream()
                    .anyMatch(like -> like.getUser().getId() == currentUser.getId());
            detailPostDTO.setLikedByCurrentUser(liked);
        }

        return detailPostDTO;
    }

    public List<PostDTO> getUserPostPage(int userId, int pageNo) {
        final int pageSize = 10;
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        User user = new User();
        user.setId(userId);
        Page<Post> posts = postRepository.findByCreator(user, pageable);
        if (posts.isEmpty())
            return new ArrayList<>();
        return posts.stream().map(this::postToDTO).collect(Collectors.toList());
    }

    public int getPostCountByUser(int userId) {
        User user = new User();
        user.setId(userId);
        return postRepository.countByCreator(user);
    }

    public List<UserDTO> getLikePage(int postId, int pageNo) {
        final int pageSize = 20;
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Post post = postRepository.findById(postId);
        List<LikePost> likePosts = post.getLikePosts();
        if (likePosts.isEmpty())
            return new ArrayList<>();
        return likePosts.stream().map(lp -> userService.userToUserDTO(lp.getUser())).collect(Collectors.toList());
    }

    public void likePost(int postId, String email) {
        Post post = postRepository.findById(postId);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        LikePost existingLike = likePostRepository.findByPostAndUser(post, user);

        if (existingLike != null) {

            likePostRepository.delete(existingLike);
        } else {

            LikePost likePost = new LikePost();
            likePost.setPost(post);
            likePost.setUser(user);
            likePostRepository.save(likePost);
        }
    }

    public DetailPostDTO getPostDetailById(int postId) {
        Post post = postRepository.findById(postId);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }
        return postToDetailDTO(post);
    }

    public Page<Post> getPostsFromUnfollowedUsers(int page, int size) {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
        User currentUser = userRepository.findByEmail(email);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findPostsFromUnfollowedUsers(currentUser.getId(), pageable);

        return posts;
    }

    public Page<Post> getPostsByHashtag(String hashtag, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Hashtag ht = hashtagRepository.findByName(hashtag);
        if (ht == null) {
            return Page.empty();
        }
        return postRepository.findByHashtag(ht, pageable);
    }

    public int getTotalPostCount() {
        return (int) postRepository.count();
    }

    public int getTotalPostLikesCount() {
        return (int) likePostRepository.count();
    }

    /**
     * Finds posts with pagination and optional search functionality for admin
     * management
     * 
     * @param pageable Pagination information
     * @param search   Optional search query for post content or creator username
     * @return Page of Post objects matching the search criteria
     */
    public Page<Post> findPostsWithPagination(Pageable pageable, String search) {
        if (search != null && !search.trim().isEmpty()) {
            return postRepository.findByContentOrCreatorUsernameContainingIgnoreCase(search.trim(), pageable);
        } else {
            return postRepository.findAll(pageable);
        }
    }

    /**
     * Find a post by its ID
     * 
     * @param id The post ID to look for
     * @return The post or null if not found
     */
    public Post findById(int id) {
        return postRepository.findById(id);
    }

    /**
     * Update a post by an admin
     * 
     * @param id      The ID of the post to update
     * @param postDTO The data to update the post with
     * @return The updated post or null if the post wasn't found
     */

    /**
     * Delete a post by its ID
     * 
     * @param id The ID of the post to delete
     * @return true if the post was deleted, false if the post wasn't found
     * @throws URISyntaxException
     */
    public boolean deletePost(int id) throws URISyntaxException {
        Post post = postRepository.findById(id);
        if (post == null) {
            return false;
        }
        if(!checkOwner(post)){
            throw new  RuntimeException("Current user not authorized");
        }

        // Delete all related media files first
        if (post.getPostMedias() != null && !post.getPostMedias().isEmpty()) {
            for (PostMedia media : post.getPostMedias()) {
                try {
                    fileService.deleteFile(media.getFileName(), "posts");
                } catch (IOException e) {
                    // Log error but continue with deletion
                    System.err.println("Error deleting media file: " + e.getMessage());
                }
            }
        }

        postRepository.delete(post);
        return true;
    }
    public boolean checkOwner(Post post){
        User creator = post.getCreator();
        String currentEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
        return creator.getEmail().equals(currentEmail);
    }
}
