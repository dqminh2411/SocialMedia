package com.ttcs.socialmedia.controller;

import com.ttcs.socialmedia.domain.dto.ResProfileDTO;
import com.ttcs.socialmedia.domain.dto.UserDTO;
import com.ttcs.socialmedia.service.ProfileService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@AllArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/{id}")
    public ResProfileDTO getProfileById(@PathVariable int id) {
        return profileService.getProfileById(id);
    }

    @GetMapping("/{id}/follower")
    public List<UserDTO> getFollowerPage(@PathVariable("id") int profileId, @RequestParam("pageNo") int pageNo){
        return profileService.getFollowerPage(profileId, pageNo-1);
    }

    @GetMapping("/{id}/following")
    public List<UserDTO> getFollowingPage(@PathVariable("id") int profileId, @RequestParam("pageNo") int pageNo){
        return profileService.getFollowingPage(profileId, pageNo-1);
    }
}
