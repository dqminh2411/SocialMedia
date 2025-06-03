package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Follow;
import com.ttcs.socialmedia.domain.Profile;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.ResProfileDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.repository.FollowRepository;
import com.ttcs.socialmedia.repository.ProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileService {
    private final ProfileRepository profileRepository;
    private final FileService fileService;
    private final UserService userService;
    private final PostService postService;
    private final FollowRepository followRepository;

    public ProfileService(ProfileRepository profileRepository, FileService fileService, UserService userService,
            PostService postService, FollowRepository followRepository) {
        this.profileRepository = profileRepository;
        this.fileService = fileService;
        this.userService = userService;
        this.postService = postService;
        this.followRepository = followRepository;
    }

    public ResProfileDTO getProfileByUserId(int id) {
        User user = new User();
        user.setId(id);
        Profile profile = profileRepository.findByUser(user);
        return profileToResProfileDTO(profile);
    }

    public ResProfileDTO getProfileByUsername(String username) {
        Profile profile = profileRepository.findByUsername(username);
        if (profile == null) {
            return null;
        }
        return profileToResProfileDTO(profile);
    }

    public ResProfileDTO update(int id, MultipartFile avatarFile, String bio) {
        User user = new User();
        user.setId(id);
        Profile profile = this.profileRepository.findByUser(user);
        final String directoryName = "avatars";
        if (profile != null) {
            String avatarFileName = "";
            if (avatarFile != null && !avatarFile.isEmpty()) {
                try {
                    this.fileService.createDirectory(directoryName);
                    avatarFileName = this.fileService.save(avatarFile, directoryName);
                    if (profile.getAvatar() != null && !profile.getAvatar().isEmpty()) {
                        this.fileService.deleteFile(profile.getAvatar(), directoryName);
                    }
                    profile.setAvatar(avatarFileName);
                } catch (URISyntaxException | IOException e) {
                    throw new RuntimeException(e);
                }
            }
            profile.setBio(bio);
            profile = this.profileRepository.save(profile);

            ResProfileDTO resProfile = profileToResProfileDTO(profile);
            return resProfile;
        }
        return null;
    }

    public ResProfileDTO profileToResProfileDTO(Profile profile) {
        ResProfileDTO resProfileDTO = new ResProfileDTO();
        resProfileDTO.setId(profile.getId());
        resProfileDTO.setBio(profile.getBio());
        resProfileDTO.setUpdateAt(profile.getUpdatedAt());
        User user = profile.getUser();
        resProfileDTO.setUserDTO(userService.userToUserDTO(user));
        resProfileDTO.setPosts(postService.getUserPostPage(user.getId(), 0));
        resProfileDTO.setTotalPostCount(postService.getPostCountByUser(user.getId()));
        resProfileDTO.setTotalFollowingCount(followRepository.countByFollowingUser(user));
        resProfileDTO.setTotalFollowerCount(followRepository.countByFollowedUser(user));
        return resProfileDTO;
    }

    public List<UserDTO> getFollowerPage(int id, int pageNo) {
        final int pageSize = 20;
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Profile p = profileRepository.findById(id);
        if (p == null)
            return null;
        User user = p.getUser();
        Page<Follow> follows = followRepository.findByFollowedUser(user, pageable);
        if (follows.isEmpty())
            return new ArrayList<>();
        return follows.getContent().stream().map(follow -> userService.userToUserDTO(follow.getFollowingUser()))
                .collect(Collectors.toList());
    }

    public List<UserDTO> getFollowingPage(int id, int pageNo) {
        final int pageSize = 20;
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Profile p = profileRepository.findById(id);
        if (p == null)
            return null;
        User user = p.getUser();
        Page<Follow> follows = followRepository.findByFollowingUser(user, pageable);
        if (follows.isEmpty())
            return new ArrayList<>();
        return follows.getContent().stream().map(follow -> userService.userToUserDTO(follow.getFollowedUser()))
                .collect(Collectors.toList());
    }

}
