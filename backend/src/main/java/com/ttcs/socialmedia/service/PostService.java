package com.ttcs.socialmedia.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ttcs.socialmedia.domain.*;
import com.ttcs.socialmedia.domain.dto.NewPostDTO;
import com.ttcs.socialmedia.domain.dto.PostDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    public PostDTO createPost(String newPostJson, List<MultipartFile> medias) throws URISyntaxException, IOException {
        Post post = new Post();
        // convert newPostJson to newPostDto

        NewPostDTO newPostDTO = objectMapper.readValue(newPostJson, NewPostDTO.class);

        // create folder to store posts' medias
        fileService.createDirectory("posts");

        User creator = new User();
        creator.setId(newPostDTO.getCreatorId());
        post.setCreator(creator);
        post.setContent(newPostDTO.getContent());

        // set media
        List<PostMedia> postMediaList = new ArrayList<>();
        if (medias != null) {
            for (int i = 1; i <= medias.size(); i++) {
                PostMedia media = new PostMedia();
                media.setPost(post);
                media.setPosition(i);
                media.setFileName(fileService.save(medias.get(i - 1), "posts"));
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
        for (MultipartFile media : newMedias) {
            PostMedia postMedia = new PostMedia();
            postMedia.setPost(post);
            postMedia.setFileName(fileService.save(media, "posts"));
            postMedia.setPosition(i++);
            postMediaRepository.save(postMedia);
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
        List<String> mediaList = postMediaRepository.findFileNamesByPostOrderByPositionAsc(post);
        postDTO.setFirstMediaName(mediaList.isEmpty() ? null : mediaList.get(0));
        return postDTO;
    }

    public List<PostDTO> getUserPostPage(int userId, int pageNo) {
        final int pageSize = 20;
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        User user = new User();
        user.setId(userId);
        Page<Post> posts = postRepository.findByCreatorOrderByCreatedAtDesc(user, pageable);
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
        LikePost likePost = new LikePost();
        likePost.setPost(post);
        likePost.setUser(user);
        likePostRepository.save(likePost);
    }

}
