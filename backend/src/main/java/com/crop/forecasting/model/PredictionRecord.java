package com.crop.forecasting.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prediction_history")
public class PredictionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private String state;
    private String district;
    private String crop;
    private String season;
    private Integer predictionYear;
    private Double areaHectares;
    private Double predictedYieldTonsPerHa;
    private Double totalEstimatedProductionTons;

    private Double rainfallMm;
    private Double avgTemperatureC;
    private Double relativeHumidityPercent;
    private Double ndvi;
    private Double soilMoisture;

    private LocalDateTime createdAt = LocalDateTime.now();

    public PredictionRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getCrop() { return crop; }
    public void setCrop(String crop) { this.crop = crop; }

    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }

    public Integer getPredictionYear() { return predictionYear; }
    public void setPredictionYear(Integer predictionYear) { this.predictionYear = predictionYear; }

    public Double getAreaHectares() { return areaHectares; }
    public void setAreaHectares(Double areaHectares) { this.areaHectares = areaHectares; }

    public Double getPredictedYieldTonsPerHa() { return predictedYieldTonsPerHa; }
    public void setPredictedYieldTonsPerHa(Double predictedYieldTonsPerHa) { this.predictedYieldTonsPerHa = predictedYieldTonsPerHa; }

    public Double getTotalEstimatedProductionTons() { return totalEstimatedProductionTons; }
    public void setTotalEstimatedProductionTons(Double totalEstimatedProductionTons) { this.totalEstimatedProductionTons = totalEstimatedProductionTons; }

    public Double getRainfallMm() { return rainfallMm; }
    public void setRainfallMm(Double rainfallMm) { this.rainfallMm = rainfallMm; }

    public Double getAvgTemperatureC() { return avgTemperatureC; }
    public void setAvgTemperatureC(Double avgTemperatureC) { this.avgTemperatureC = avgTemperatureC; }

    public Double getRelativeHumidityPercent() { return relativeHumidityPercent; }
    public void setRelativeHumidityPercent(Double relativeHumidityPercent) { this.relativeHumidityPercent = relativeHumidityPercent; }

    public Double getNdvi() { return ndvi; }
    public void setNdvi(Double ndvi) { this.ndvi = ndvi; }

    public Double getSoilMoisture() { return soilMoisture; }
    public void setSoilMoisture(Double soilMoisture) { this.soilMoisture = soilMoisture; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
