package com.crop.forecasting.repository;

import com.crop.forecasting.model.RecommendationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecommendationRecordRepository extends JpaRepository<RecommendationRecord, Long> {
    List<RecommendationRecord> findTop20ByOrderByCreatedAtDesc();
    List<RecommendationRecord> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}
