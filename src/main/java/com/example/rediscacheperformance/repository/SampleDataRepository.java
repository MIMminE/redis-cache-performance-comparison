package com.example.rediscacheperformance.repository;

import com.example.rediscacheperformance.entity.SampleData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SampleDataRepository extends JpaRepository<SampleData, Long> {
    
    List<SampleData> findByCategory(String category);
    
    List<SampleData> findByNameContainingIgnoreCase(String name);
}
