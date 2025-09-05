package com.example.rediscacheperformance.service;

import com.example.rediscacheperformance.entity.PerformanceMetrics;
import com.example.rediscacheperformance.repository.PerformanceMetricsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PerformanceService {
    
    private final PerformanceMetricsRepository performanceMetricsRepository;
    
    public void recordPerformanceMetrics(String apiName, Boolean cacheEnabled, 
                                       Long responseTimeMs, Boolean cacheHit) {
        PerformanceMetrics metrics = PerformanceMetrics.builder()
                .apiName(apiName)
                .cacheEnabled(cacheEnabled)
                .responseTimeMs(responseTimeMs)
                .cacheHit(cacheHit)
                .requestCount(1)
                .build();
        
        performanceMetricsRepository.save(metrics);
        log.info("Performance metrics recorded: API={}, Cache={}, ResponseTime={}ms, Hit={}", 
                apiName, cacheEnabled, responseTimeMs, cacheHit);
    }
    
    public Map<String, Object> getPerformanceStatistics(String apiName) {
        // 캐시 사용 시 통계
        Double avgResponseTimeWithCache = performanceMetricsRepository
                .findAverageResponseTimeByApiNameAndCacheEnabled(apiName, true);
        Long cacheHits = performanceMetricsRepository
                .countCacheHitsByApiNameAndCacheEnabled(apiName, true);
        Long totalRequestsWithCache = performanceMetricsRepository
                .countTotalRequestsByApiNameAndCacheEnabled(apiName, true);
        
        // 캐시 미사용 시 통계
        Double avgResponseTimeWithoutCache = performanceMetricsRepository
                .findAverageResponseTimeByApiNameAndCacheEnabled(apiName, false);
        Long totalRequestsWithoutCache = performanceMetricsRepository
                .countTotalRequestsByApiNameAndCacheEnabled(apiName, false);
        
        // 캐시 적중률 계산
        Double cacheHitRate = totalRequestsWithCache > 0 ? 
                (double) cacheHits / totalRequestsWithCache * 100 : 0.0;
        
        return Map.of(
                "withCache", Map.of(
                        "avgResponseTime", avgResponseTimeWithCache != null ? avgResponseTimeWithCache : 0.0,
                        "totalRequests", totalRequestsWithCache,
                        "cacheHits", cacheHits,
                        "cacheHitRate", cacheHitRate
                ),
                "withoutCache", Map.of(
                        "avgResponseTime", avgResponseTimeWithoutCache != null ? avgResponseTimeWithoutCache : 0.0,
                        "totalRequests", totalRequestsWithoutCache
                )
        );
    }
    
    public List<PerformanceMetrics> getRecentMetrics(String apiName, int limit) {
        return performanceMetricsRepository.findByApiNameAndCacheEnabled(apiName, true)
                .stream()
                .limit(limit)
                .toList();
    }
}
