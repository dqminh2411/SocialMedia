package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Follow;
import com.ttcs.socialmedia.domain.User;
import com.ttcs.socialmedia.domain.dto.FollowDTO;
import com.ttcs.socialmedia.repository.FollowRepository;
import com.ttcs.socialmedia.repository.UserRepository;
import com.ttcs.socialmedia.util.SecurityUtil;
import com.ttcs.socialmedia.util.constants.FollowStatus;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class FollowService {
    private final FollowRepository followRepository;
    private final UserRepository userRepository;


    @Transactional
    public void createFollow(FollowDTO followDTO) {
        String curEmail = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No current user"));
        User followingUser = userRepository.findByEmail(curEmail);
        User followedUser = userRepository.findById(followDTO.getFollowedUserId());
        if (followingUser != null && followedUser != null) {
            Follow follow = new Follow();
            follow.setFollowingUser(followingUser);
            follow.setFollowedUser(followedUser);
            followRepository.save(follow);
        }
    }

    @Transactional
    public void confirmFollow(int followId) {
        Follow follow = followRepository.findById(followId);
        String curEmail = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No current user"));
        User followedUser = userRepository.findByEmail(curEmail);
        if(followedUser == null || follow == null || follow.getFollowedUser().getId() != followedUser.getId()){
            return;
        }

        follow.setStatus(FollowStatus.CONFIRMED);
        followRepository.save(follow);

    }

    @Transactional
    public void deleteFollow(int followId) {
        Follow follow = followRepository.findById(followId);
        String currentUserEmail = com.ttcs.socialmedia.util.SecurityUtil.getCurrentUserLogin().orElse(null);
        if (follow != null && currentUserEmail != null && follow.getFollowedUser().getEmail().equals(currentUserEmail)) {
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
