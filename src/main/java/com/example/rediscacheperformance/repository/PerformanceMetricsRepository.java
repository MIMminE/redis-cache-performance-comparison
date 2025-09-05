package com.example.rediscacheperformance.repository;

import com.example.rediscacheperformance.entity.PerformanceMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PerformanceMetricsRepository extends JpaRepository<PerformanceMetrics, Long> {
    
    List<PerformanceMetrics> findByApiNameAndCacheEnabled(String apiName, Boolean cacheEnabled);
    
    List<PerformanceMetrics> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT AVG(p.responseTimeMs) FROM PerformanceMetrics p WHERE p.apiName = ?1 AND p.cacheEnabled = ?2")
    Double findAverageResponseTimeByApiNameAndCacheEnabled(String apiName, Boolean cacheEnabled);
    
    @Query("SELECT COUNT(p) FROM PerformanceMetrics p WHERE p.apiName = ?1 AND p.cacheEnabled = ?2 AND p.cacheHit = true")
    Long countCacheHitsByApiNameAndCacheEnabled(String apiName, Boolean cacheEnabled);
    
    @Query("SELECT COUNT(p) FROM PerformanceMetrics p WHERE p.apiName = ?1 AND p.cacheEnabled = ?2")
    Long countTotalRequestsByApiNameAndCacheEnabled(String apiName, Boolean cacheEnabled);
}
