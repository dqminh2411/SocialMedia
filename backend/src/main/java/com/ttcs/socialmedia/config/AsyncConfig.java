package com.ttcs.socialmedia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    @Bean("redisFlushExecutor")
    public Executor redisFlushExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);// minimum workers running at a time to keep alive without timing out (minimum number created even there are idle threads)
        executor.setMaxPoolSize(5);// maximum threads can be created
        executor.setQueueCapacity(100); // queue size of a worker (new thread is created if current number of items exceeds executor's capacity
        executor.setThreadNamePrefix("redis-flush-");
        executor.initialize();
        return executor;
    }

    @Bean("mediaDeleteExecutor")
    public Executor mediaDeleteExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);// minimum workers running at a time to keep alive without timing out (minimum number created even there are idle threads)
        executor.setMaxPoolSize(5);// maximum threads can be created
        executor.setQueueCapacity(100); // queue size of a worker (new thread is created if current number of items exceeds executor's capacity
        executor.setThreadNamePrefix("media-delete-");
        executor.initialize();
        return executor;
    }
}
