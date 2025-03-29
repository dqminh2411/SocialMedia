package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Post;
import com.ttcs.socialmedia.domain.PostMedia;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.PostDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final FileService fileService;
    private final PostMediaRepository postMediaRepository;
    private final LikePostRepository likePostRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public PostDTO createPost(int creatorId, String content , MultipartFile[] images) throws URISyntaxException, IOException {
        Post post = new Post();
        // create folder to store posts' images
        fileService.createDirectory("posts");

        User creator = new User();
        creator.setId(creatorId);
        post.setCreator(creator);


        post.setContent(content);
        List<PostMedia> postMediaList = new ArrayList<>();
        if(images != null){
            for(int i=1; i<=images.length; i++){
                PostMedia image= new PostMedia();
                image.setPost(post);
                image.setPosition(i);
                image.setFileName(fileService.save(images[i-1], "posts"));
                postMediaList.add(image);
            }
        }
        post.setPostMedias(postMediaList);
        post = postRepository.save(post);

        PostDTO postDTO = new PostDTO();
        postDTO.setId(post.getId());
        postDTO.setContent(post.getContent());
        postDTO.setLikes(likePostRepository.countByPost(post));
        List<String> imageList = postMediaRepository.findFileNamesByPostOrderByPositionAsc(post);
        postDTO.setImageNames(imageList);
        postDTO.setCreatedAt(post.getCreatedAt());
        postDTO.setUserDTO(new UserDTO(userRepository.findById(post.getCreator().getId())));

        return postDTO;
    }
}
