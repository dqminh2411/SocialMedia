package com.ttcs.socialmedia.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ttcs.socialmedia.domain.*;
import com.ttcs.socialmedia.domain.dto.*;
import com.ttcs.socialmedia.repository.*;
import com.ttcs.socialmedia.util.SanitizeUtil;
import com.ttcs.socialmedia.util.SecurityUtil;
import com.ttcs.socialmedia.util.constants.NotificationReferenceType;
import com.ttcs.socialmedia.util.constants.NotificationType;
import com.ttcs.socialmedia.util.error.AppException;
import com.ttcs.socialmedia.util.error.ErrorCode;
import com.ttcs.socialmedia.util.event.MediaDeleteEvent;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
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
    private final NotificationService notificationService;
    private ApplicationEventPublisher eventPublisher;

    public PostDTO getPostById(int postId) {
        Post post = postRepository.findById(postId);
        if (post == null) {
            throw new AppException(ErrorCode.POST_NOT_FOUND);
        }
        return postToDTO(post);
    }

    public Page<Post> getHomePosts(int page) {
        int pageSize = 10;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("createdAt").descending());
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));
        User currentUser = userRepository.findByEmail(email);
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        return postRepository.findPostsFromFollowedUsers(currentUser.getId(), pageable);
    }

    @Transactional
    public PostDTO createPost(String newPostJson, List<MultipartFile> medias) throws URISyntaxException, IOException {
        Post post = new Post();
        // convert newPostJson to newPostDto

        NewPostDTO newPostDTO = objectMapper.readValue(newPostJson, NewPostDTO.class);

        // Determine creator from authenticated user, ignore any client-provided creatorId
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));
        User currentUser = userRepository.findByEmail(email);
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        post.setCreator(currentUser);
        // sanitize input
        post.setContent(SanitizeUtil.clean(newPostDTO.getContent()));

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
                if(h==null || SanitizeUtil.containsHtml(h)) continue;
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
        log.info("New post id: " + post.getId() + " created!");
        return postToDTO(post);

    }

    @Transactional
    public PostDTO updatePost(int id, String postJson, String mediasToDeleteJson, List<MultipartFile> newMedias)
            throws URISyntaxException, IOException {
        Post post = postRepository.findById(id);
        if(checkOwner(post)){
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        if (post == null) {
            throw new AppException(ErrorCode.POST_NOT_FOUND);
        }
        if (mediasToDeleteJson == null) {
            mediasToDeleteJson = "[]"; // default to empty list if null
        }
        List<String> tmp = objectMapper.readValue(mediasToDeleteJson, new TypeReference<List<String>>() {});
        Set<String> mediasToDelete = new HashSet<>(tmp);

        // convert postJson to newPostDto
        NewPostDTO newPostDTO = objectMapper.readValue(postJson, NewPostDTO.class);

        post.setContent(SanitizeUtil.clean(newPostDTO.getContent()));
        // delete medias
        List<String> filesNameToDelete = new ArrayList<>();
        List<PostMedia> remainingMedias = new ArrayList<>();
        for(PostMedia pm : post.getPostMedias()){
            if(mediasToDelete.contains(pm.getFileName())){
                filesNameToDelete.add(pm.getFileName());
            }else{
                remainingMedias.add(pm);
            }
        }
        post.getPostMedias().clear();
        post.getPostMedias().addAll(remainingMedias);
        // update medias' positions

        int i = 1;
        for (PostMedia pm : post.getPostMedias()) {
            pm.setPosition(i++);
        }
        // insert new medias
        if (newMedias != null && !newMedias.isEmpty()) {
            for (MultipartFile media : newMedias) {
                PostMedia postMedia = new PostMedia();
                postMedia.setPost(post);
                postMedia.setFileName(fileService.upload(media, "posts"));
                postMedia.setPosition(i++);
                post.getPostMedias().add(postMedia);
            }
        }

        // update mentions
        post.getPostMentions().clear();
        Set<String> newMentions = new HashSet<>(newPostDTO.getMentions());
        for (String mention : newMentions) {
            User mentionedUser = userRepository.findByUsername(mention);
            if (mentionedUser != null) {
                PostMentions postMention = new PostMentions();
                postMention.setPost(post);
                postMention.setUser(mentionedUser);
                post.getPostMentions().add(postMention);

            }
        }

        // update hashtags
        Set<String> newHashtags = new HashSet<>(newPostDTO.getHashtags());
        post.getPostHashtags().clear();

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
            post.getPostHashtags().add(postHashtag);
        }
        // update post

        // return updated post
        post = postRepository.save(post);

        // publish event to delete media files to guarantee updatePost transaction is done before media files are deleted
        // as deleting files is not transactional
        String mediaDir = "posts";
        eventPublisher.publishEvent(new MediaDeleteEvent(filesNameToDelete, mediaDir));
        log.info("Post with id: " + post.getId() + " updated");
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

    @Transactional
    public void likePost(int postId) {
        Post post = postRepository.findById(postId);
        if (post == null) {
            throw new AppException(ErrorCode.POST_NOT_FOUND);
        }
        String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        LikePost existingLike = likePostRepository.findByPostAndUser(post, user);

        if (existingLike == null) {
            LikePost likePost = new LikePost();
            likePost.setPost(post);
            likePost.setUser(user);
            likePost = likePostRepository.save(likePost);
            if(!post.getCreator().getEmail().equals(email)){
                Notification notification = Notification.builder()
                        .type(NotificationType.POST_LIKE)
                        .sender(user)
                        .referenceType(NotificationReferenceType.POST)
                        .referencedId(post.getId())
                        .createdAt(Instant.now())
                        .recipient(post.getCreator())
                        .read(false)
                        .content(user.getUsername() + NotificationType.POST_LIKE.getTemplateMessage())
                        .build();
                notificationService.sendNotification(notification);
            }
            if(likePost.getId() == 0)
                throw new AppException(ErrorCode.POST_LIKE_FAILED);
        }
        log.info("Post with id: " + post.getId() + " liked");
    }

    public void unlikePost(int postId) {
        Post post = postRepository.findById(postId);
        if (post == null) {
            throw new AppException(ErrorCode.POST_NOT_FOUND);
        }
        String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        int rowDeleted = likePostRepository.deleteByPostAndUser(post,user);
        if (rowDeleted == 0) {
            throw new AppException(ErrorCode.POST_UNLIKE_FAILED);
        }
        log.info("Post with id: " + post.getId() + " unliked");
    }

    public DetailPostDTO getPostDetailById(int postId) {
        Post post = postRepository.findById(postId);
        if (post == null) {
            throw new AppException(ErrorCode.POST_NOT_FOUND);
        }
        return postToDetailDTO(post);
    }

    public Page<Post> getPostsFromUnfollowedUsers(int page, int size) {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));
        User currentUser = userRepository.findByEmail(email);
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
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
    @Transactional
    public boolean deletePost(int id) throws URISyntaxException {
        Post post = postRepository.findById(id);
        if (post == null) {
            return false;
        }
        if(checkOwner(post)){
            throw new  AppException(ErrorCode.ACCESS_DENIED);
        }

        List<String> filesNameToDelete = new ArrayList<>();
        // Delete all related media files first
        if (post.getPostMedias() != null && !post.getPostMedias().isEmpty()) {
            for (PostMedia media : post.getPostMedias()) {
                filesNameToDelete.add(media.getFileName());
            }
        }
        postRepository.delete(post);

        // publish event to delete media
        String mediaDir = "posts";
        eventPublisher.publishEvent(new MediaDeleteEvent(filesNameToDelete,mediaDir));

        log.info("Post with id: " + post.getId() + " deleted");
        return true;
    }
    public boolean checkOwner(Post post){
        User creator = post.getCreator();
        String currentEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));
        return !creator.getEmail().equals(currentEmail);
    }
}
