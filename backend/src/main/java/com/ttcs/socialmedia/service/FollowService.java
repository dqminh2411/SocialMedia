package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Follow;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.FollowDTO;
import com.ttcs.socialmedia.repository.FollowRepository;
import com.ttcs.socialmedia.repository.UserRepository;
import com.ttcs.socialmedia.util.constants.FollowStatus;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class FollowService {
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public void createFollow(FollowDTO followDTO) {
        User followingUser = userRepository.findById(followDTO.getFollowingUserId());
        User followedUser = userRepository.findById(followDTO.getFollowedUserId());
        if (followingUser != null && followedUser != null) {
            Follow follow = new Follow();
            follow.setFollowingUser(followingUser);
            follow.setFollowedUser(followedUser);
            followRepository.save(follow);
        }
    }
    public void confirmFollow(int followId) {
        Follow follow = followRepository.findById(followId);
        if (follow != null) {
            follow.setStatus(FollowStatus.CONFIRMED);
            followRepository.save(follow);
        }
    }
    public void deleteFollow(int followId) {
        Follow follow = followRepository.findById(followId);
        if (follow != null) {
            followRepository.delete(follow);
        }
    }

}
