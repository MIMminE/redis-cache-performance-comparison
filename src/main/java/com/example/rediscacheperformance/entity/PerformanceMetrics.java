package com.example.rediscacheperformance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "performance_metrics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceMetrics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "api_name", nullable = false)
    private String apiName;
    
    @Column(name = "cache_enabled", nullable = false)
    private Boolean cacheEnabled;
    
    @Column(name = "response_time_ms", nullable = false)
    private Long responseTimeMs;
    
    @Column(name = "cache_hit", nullable = false)
    private Boolean cacheHit;
    
    @Column(name = "request_count")
    private Integer requestCount;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
