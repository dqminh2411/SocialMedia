package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.PostView;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Scanner;

@Slf4j
@Component
@AllArgsConstructor
public class RedisFlushScheduler {
    private final RedisTemplate<String, Object> redisTemplate;
    private final PostViewFlushService postViewFlushService;

    @Scheduled(fixedRate = 3000)
    public void schedulePostViewFlush() {
        ScanOptions options = ScanOptions.scanOptions()
                .match("postView:user:*")
                .count(100)
                .build();
        try (Cursor<byte[]> cursor =
                     redisTemplate.getConnectionFactory()
                             .getConnection()
                             .scan(options)) {

            while (cursor.hasNext()) {
                String key = new String(cursor.next(), StandardCharsets.UTF_8);
                postViewFlushService.flushAsync(key);
                log.info("Flushed PostView: " + key);
            }
        }
    }
}
