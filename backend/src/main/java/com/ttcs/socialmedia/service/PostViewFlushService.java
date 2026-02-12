package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Post;
import com.ttcs.socialmedia.domain.PostView;
import com.ttcs.socialmedia.domain.PostViewId;
import com.ttcs.socialmedia.repository.PostViewRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@AllArgsConstructor
public class PostViewFlushService {
    private final PostViewRepository postViewRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Async("redisFlushExecutor")
    public void flushAsync(String redisKey) {
        Map<Object, Object> entries = redisTemplate
                .opsForHash().entries(redisKey);

        int userId = Integer.parseInt(redisKey.substring(redisKey.lastIndexOf(":")+1));
        System.out.println(entries);
        if (entries == null || entries.isEmpty()) {
            return;
        }

        // Persist to DB (batch insert)
        List<PostView> postViews = new ArrayList<>();
        for(var e : entries.keySet()){
            int postId = Integer.parseInt(e.toString());
            Instant lastSeenAt = Instant.ofEpochMilli(Long.parseLong(entries.get(e).toString()));
            postViews.add(new PostView(postId,userId,lastSeenAt));
        }
        postViewRepository.saveAll(postViews);

        // Remove key after successful flush
        redisTemplate.delete(redisKey);
    }
}
