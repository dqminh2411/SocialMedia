package com.ttcs.socialmedia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    @Override
    public Executor getAsyncExecutor(){
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1); // minimum workers running at a time to keep alive without timing out (minimum number created even there are idle threads)
        executor.setMaxPoolSize(5); // maximum threads can be created
        executor.setQueueCapacity(30); // queue size of a worker (new thread is created if current number of items exceeds executor's capacity
        executor.setThreadNamePrefix("ThreadPoolExecutor-");
        executor.initialize();
        return executor;
    }
}
