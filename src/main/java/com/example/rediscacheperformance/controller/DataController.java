package com.example.rediscacheperformance.controller;

import com.example.rediscacheperformance.entity.SampleData;
import com.example.rediscacheperformance.service.DataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class DataController {
    
    private final DataService dataService;
    
    /**
     * 모든 데이터 조회 (캐시 미사용)
     */
    @GetMapping("/all/without-cache")
    public ResponseEntity<List<SampleData>> getAllDataWithoutCache() {
        return ResponseEntity.ok(dataService.getAllDataWithoutCache());
    }
    
    /**
     * 모든 데이터 조회 (캐시 사용)
     */
    @GetMapping("/all/with-cache")
    public ResponseEntity<List<SampleData>> getAllDataWithCache() {
        return ResponseEntity.ok(dataService.getAllDataWithCache());
    }
    
    /**
     * 카테고리별 데이터 조회 (캐시 미사용)
     */
    @GetMapping("/category/{category}/without-cache")
    public ResponseEntity<List<SampleData>> getDataByCategoryWithoutCache(@PathVariable String category) {
        return ResponseEntity.ok(dataService.getDataByCategoryWithoutCache(category));
    }
    
    /**
     * 카테고리별 데이터 조회 (캐시 사용)
     */
    @GetMapping("/category/{category}/with-cache")
    public ResponseEntity<List<SampleData>> getDataByCategoryWithCache(@PathVariable String category) {
        return ResponseEntity.ok(dataService.getDataByCategoryWithCache(category));
    }
    
    /**
     * ID로 데이터 조회 (캐시 미사용)
     */
    @GetMapping("/{id}/without-cache")
    public ResponseEntity<Optional<SampleData>> getDataByIdWithoutCache(@PathVariable Long id) {
        return ResponseEntity.ok(dataService.getDataByIdWithoutCache(id));
    }
    
    /**
     * ID로 데이터 조회 (캐시 사용)
     */
    @GetMapping("/{id}/with-cache")
    public ResponseEntity<Optional<SampleData>> getDataByIdWithCache(@PathVariable Long id) {
        return ResponseEntity.ok(dataService.getDataByIdWithCache(id));
    }
}
