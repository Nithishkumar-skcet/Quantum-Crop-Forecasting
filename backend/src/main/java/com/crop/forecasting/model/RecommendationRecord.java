package com.crop.forecasting.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation_history")
public class RecommendationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private String district;
    private String season;

    @Column(name = "prediction_year")
    private Integer year;

    private Double areaHectares;

    private String topCrop;
    private Double topPredictedYield;

    private Integer availableCropsCount;

    private LocalDateTime createdAt = LocalDateTime.now();

    public RecommendationRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Double getAreaHectares() { return areaHectares; }
    public void setAreaHectares(Double areaHectares) { this.areaHectares = areaHectares; }

    public String getTopCrop() { return topCrop; }
    public void setTopCrop(String topCrop) { this.topCrop = topCrop; }

    public Double getTopPredictedYield() { return topPredictedYield; }
    public void setTopPredictedYield(Double topPredictedYield) { this.topPredictedYield = topPredictedYield; }

    public Integer getAvailableCropsCount() { return availableCropsCount; }
    public void setAvailableCropsCount(Integer availableCropsCount) { this.availableCropsCount = availableCropsCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
