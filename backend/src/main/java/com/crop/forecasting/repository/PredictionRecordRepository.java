package com.crop.forecasting.repository;

import com.crop.forecasting.model.PredictionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PredictionRecordRepository extends JpaRepository<PredictionRecord, Long> {
    List<PredictionRecord> findTop20ByOrderByCreatedAtDesc();
    List<PredictionRecord> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}
