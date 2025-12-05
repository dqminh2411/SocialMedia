package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.dto.ResProfileDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.service.ProfileService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profile")
@AllArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/{userId}")
    public ResProfileDTO getProfileByUserId(@PathVariable int userId) {
        return profileService.getProfileByUserId(userId);
    }

    @GetMapping("/un/{username}")
    public ResProfileDTO getProfileByUsername(@PathVariable String username) {
        return profileService.getProfileByUsername(username);
    }

    @GetMapping("/{id}/followers")
    public List<UserDTO> getFollowerPage(@PathVariable("id") int profileId, @RequestParam("pageNo") int pageNo) {
        return profileService.getFollowerPage(profileId, pageNo - 1);
    }

    @GetMapping("/{id}/followings")
    public List<UserDTO> getFollowingPage(@PathVariable("id") int profileId, @RequestParam("pageNo") int pageNo) {
        return profileService.getFollowingPage(profileId, pageNo - 1);
    }

    @PutMapping("/update")
    public ResProfileDTO updateProfile(@RequestParam(name = "avatar", required = false) MultipartFile avatarFile,
                                       @RequestParam(name = "bio", required = false) String bio) {
        return this.profileService.update(avatarFile, bio);

    }
}
