package com.example.rediscacheperformance.service;

import com.example.rediscacheperformance.entity.SampleData;
import com.example.rediscacheperformance.repository.SampleDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataService {

    private final SampleDataRepository sampleDataRepository;

    /**
     * 캐시를 사용하지 않는 데이터 조회
     */
    public List<SampleData> getAllDataWithoutCache() {
        // 실제 DB 조회 시뮬레이션을 위한 지연
        simulateDatabaseDelay();
        return sampleDataRepository.findAll();
    }

    /**
     * 캐시를 사용하는 데이터 조회
     */
    @Cacheable(value = "sampleData", key = "'all'")
    public List<SampleData> getAllDataWithCache() {
        // 실제 DB 조회 시뮬레이션을 위한 지연
        simulateDatabaseDelay();
        return sampleDataRepository.findAll();
    }

    /**
     * 카테고리별 데이터 조회 (캐시 미사용)
     */
    public List<SampleData> getDataByCategoryWithoutCache(String category) {
        simulateDatabaseDelay();
        return sampleDataRepository.findByCategory(category);
    }

    /**
     * 카테고리별 데이터 조회 (캐시 사용)
     */
    @Cacheable(value = "sampleData", key = "#category")
    public List<SampleData> getDataByCategoryWithCache(String category) {
        simulateDatabaseDelay();
        return sampleDataRepository.findByCategory(category);
    }

    /**
     * ID로 데이터 조회 (캐시 미사용)
     */
    public Optional<SampleData> getDataByIdWithoutCache(Long id) {
        simulateDatabaseDelay();
        return sampleDataRepository.findById(id);
    }

    /**
     * ID로 데이터 조회 (캐시 사용)
     */
    @Cacheable(value = "sampleData", key = "#id")
    public Optional<SampleData> getDataByIdWithCache(Long id) {
        simulateDatabaseDelay();
        return sampleDataRepository.findById(id);
    }

    /**
     * 데이터베이스 조회 지연 시뮬레이션
     */
    private void simulateDatabaseDelay() {
        try {
            // 100-500ms 사이의 랜덤 지연
            Thread.sleep(100 + (long) (Math.random() * 400));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
