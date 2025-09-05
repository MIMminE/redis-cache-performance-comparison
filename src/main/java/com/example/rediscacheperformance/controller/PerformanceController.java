package com.example.rediscacheperformance.controller;

import com.example.rediscacheperformance.service.DataService;
import com.example.rediscacheperformance.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
@Slf4j
public class PerformanceController {
    
    private final DataService dataService;
    private final PerformanceService performanceService;
    private final CacheManager cacheManager;
    
    /**
     * 캐시를 사용하지 않는 데이터 조회 API
     */
    @GetMapping("/data/without-cache")
    public ResponseEntity<Map<String, Object>> getDataWithoutCache() {
        long startTime = System.currentTimeMillis();
        
        try {
            List<?> data = dataService.getAllDataWithoutCache();
            long responseTime = System.currentTimeMillis() - startTime;
            
            // 성능 메트릭 기록
            performanceService.recordPerformanceMetrics(
                    "getAllData", false, responseTime, false);
            
            return ResponseEntity.ok(Map.of(
                    "data", data,
                    "responseTime", responseTime,
                    "cacheEnabled", false,
                    "timestamp", LocalDateTime.now()
            ));
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            log.error("Error in getDataWithoutCache", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", e.getMessage(),
                    "responseTime", responseTime,
                    "cacheEnabled", false
            ));
        }
    }
    
    /**
     * 캐시를 사용하는 데이터 조회 API
     */
    @GetMapping("/data/with-cache")
    public ResponseEntity<Map<String, Object>> getDataWithCache() {
        long startTime = System.currentTimeMillis();
        boolean cacheHit = false;
        
        try {
            // 캐시 적중 여부를 확인하기 위한 로그 기반 판단
            // 실제로는 Redis에서 직접 확인해야 하지만, 여기서는 간단히 처리
            List<?> data = dataService.getAllDataWithCache();
            long responseTime = System.currentTimeMillis() - startTime;
            
            // 응답 시간이 매우 빠르면 캐시 적중으로 간주 (100ms 이하)
            cacheHit = responseTime < 100;
            
            // 성능 메트릭 기록
            performanceService.recordPerformanceMetrics(
                    "getAllData", true, responseTime, cacheHit);
            
            return ResponseEntity.ok(Map.of(
                    "data", data,
                    "responseTime", responseTime,
                    "cacheEnabled", true,
                    "cacheHit", cacheHit,
                    "timestamp", LocalDateTime.now()
            ));
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            log.error("Error in getDataWithCache", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", e.getMessage(),
                    "responseTime", responseTime,
                    "cacheEnabled", true
            ));
        }
    }
    
    /**
     * 성능 통계 조회 API
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPerformanceStatistics() {
        try {
            Map<String, Object> statistics = performanceService.getPerformanceStatistics("getAllData");
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting performance statistics", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 캐시 클리어 API
     */
    @PostMapping("/cache/clear")
    public ResponseEntity<Map<String, String>> clearCache() {
        try {
            // CacheManager를 사용해서 캐시를 클리어
            cacheManager.getCacheNames().forEach(cacheName -> {
                cacheManager.getCache(cacheName).clear();
                log.info("Cache '{}' cleared", cacheName);
            });
            
            return ResponseEntity.ok(Map.of("message", "Cache cleared successfully"));
        } catch (Exception e) {
            log.error("Error clearing cache", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
