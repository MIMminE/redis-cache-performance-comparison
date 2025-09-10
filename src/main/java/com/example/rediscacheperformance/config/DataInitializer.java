package com.example.rediscacheperformance.config;

import com.example.rediscacheperformance.entity.SampleData;
import com.example.rediscacheperformance.repository.SampleDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@DependsOn("entityManagerFactory")
public class DataInitializer implements CommandLineRunner {
    
    private final SampleDataRepository sampleDataRepository;
    
    @Override
    public void run(String... args) throws Exception {
        try {
            // 테이블이 존재하는지 확인
            long count = sampleDataRepository.count();
            log.info("Current sample data count: {}", count);
            
            if (count == 0) {
                log.info("Initializing sample data...");
                
                List<SampleData> sampleData = List.of(
                    SampleData.builder()
                            .name("Product A")
                            .description("High-quality product A")
                            .price(100)
                            .category("Electronics")
                            .build(),
                    SampleData.builder()
                            .name("Product B")
                            .description("Premium product B")
                            .price(200)
                            .category("Electronics")
                            .build(),
                    SampleData.builder()
                            .name("Service X")
                            .description("Professional service X")
                            .price(150)
                            .category("Services")
                            .build(),
                    SampleData.builder()
                            .name("Service Y")
                            .description("Basic service Y")
                            .price(75)
                            .category("Services")
                            .build(),
                    SampleData.builder()
                            .name("Item 1")
                            .description("Standard item 1")
                            .price(50)
                            .category("General")
                            .build(),
                    SampleData.builder()
                            .name("Item 2")
                            .description("Standard item 2")
                            .price(60)
                            .category("General")
                            .build(),
                    SampleData.builder()
                            .name("Premium Product")
                            .description("Top-tier premium product")
                            .price(500)
                            .category("Electronics")
                            .build(),
                    SampleData.builder()
                            .name("Basic Service")
                            .description("Essential basic service")
                            .price(25)
                            .category("Services")
                            .build()
            );
            
                sampleDataRepository.saveAll(sampleData);
                log.info("Sample data initialized with {} records", sampleData.size());
            } else {
                log.info("Sample data already exists, skipping initialization");
            }
        } catch (Exception e) {
            log.error("Failed to initialize sample data: {}", e.getMessage());
            log.warn("This might be due to table not being created yet. Data will be initialized on next startup.");
        }
    }
}
