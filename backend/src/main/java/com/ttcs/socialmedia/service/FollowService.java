package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Follow;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.FollowDTO;
import com.ttcs.socialmedia.repository.FollowRepository;
import com.ttcs.socialmedia.repository.UserRepository;
import com.ttcs.socialmedia.util.constants.FollowStatus;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    public String checkFollowStatus(int followingUserId, int followedUserId) {
        String status = followRepository.checkFollowStatus(followingUserId, followedUserId);

        return status;
    }

    public Follow getFollowByUsers(int followingUserId, int followedUserId) {
        User followingUser = userRepository.findById(followingUserId);
        User followedUser = userRepository.findById(followedUserId);
        if (followingUser != null && followedUser != null) {
            return followRepository.findByFollowingUserAndFollowedUser(followingUser, followedUser);
        }
        return null;
    }

    public Page<User> getUserFollowers(int userId, String query, int pageNo, int pageSize) {
        if (query == null) {
            query = "";
        }
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        User user = this.userRepository.findById(userId);
        Page<User> followersPage = followRepository.findUserFollowerByStatus(user, FollowStatus.CONFIRMED, query,
                pageable);
        return followersPage;
    }

    public Page<User> getUserFollowings(int userId, String query, int pageNo, int pageSize) {
        if (query == null) {
            query = "";
        }
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        User user = this.userRepository.findById(userId);
        Page<User> followingsPage = followRepository.findUserFollowingByStatus(user, FollowStatus.CONFIRMED, query,
                pageable);
        return followingsPage;
    }
}
