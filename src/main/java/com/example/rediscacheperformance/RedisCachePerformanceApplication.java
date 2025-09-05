package com.example.rediscacheperformance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class RedisCachePerformanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RedisCachePerformanceApplication.class, args);
    }

}
