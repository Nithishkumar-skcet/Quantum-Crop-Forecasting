package com.crop.forecasting.service;

import com.crop.forecasting.dto.MlPredictionDto;
import com.crop.forecasting.dto.MlRecommendationDto;
import com.crop.forecasting.model.PredictionRecord;
import com.crop.forecasting.model.RecommendationRecord;
import com.crop.forecasting.repository.PredictionRecordRepository;
import com.crop.forecasting.repository.RecommendationRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class PythonMlService {

    @Value("${app.ml-service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private PredictionRecordRepository predictionRecordRepository;

    @Autowired
    private RecommendationRecordRepository recommendationRecordRepository;

    public Map<String, Object> getMetadata() {
        String url = mlServiceUrl + "/api/v1/metadata";
        return restTemplate.getForObject(url, Map.class);
    }

    public Map<String, Object> getEnvironmentalData(String district, Integer year) {
        if (year == null) year = 2026;
        String url = mlServiceUrl + "/api/v1/environment/" + district + "?year=" + year;
        return restTemplate.getForObject(url, Map.class);
    }

    public MlPredictionDto.Response predictYield(MlPredictionDto.Request request, String userEmail) {
        String url = mlServiceUrl + "/api/v1/predict";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<MlPredictionDto.Request> entity = new HttpEntity<>(request, headers);

        ResponseEntity<MlPredictionDto.Response> response = restTemplate.postForEntity(url, entity, MlPredictionDto.Response.class);
        MlPredictionDto.Response body = response.getBody();

        if (body != null) {
            try {
                PredictionRecord record = new PredictionRecord();
                record.setUserEmail(userEmail != null ? userEmail : "guest@system.com");
                record.setState(body.getState());
                record.setDistrict(body.getDistrict());
                record.setCrop(body.getCrop());
                record.setSeason(body.getSeason());
                record.setPredictionYear(body.getYear());
                record.setAreaHectares(body.getArea_hectares());
                record.setPredictedYieldTonsPerHa(body.getPredicted_yield_tons_per_ha());
                record.setTotalEstimatedProductionTons(body.getTotal_estimated_production_tons());

                if (body.getEnvironmental_features() != null) {
                    Map<String, Object> env = body.getEnvironmental_features();
                    if (env.containsKey("Rainfall_mm")) record.setRainfallMm(toDouble(env.get("Rainfall_mm")));
                    if (env.containsKey("Avg_Temperature_C")) record.setAvgTemperatureC(toDouble(env.get("Avg_Temperature_C")));
                    if (env.containsKey("Relative_Humidity_Percent")) record.setRelativeHumidityPercent(toDouble(env.get("Relative_Humidity_Percent")));
                    if (env.containsKey("NDVI")) record.setNdvi(toDouble(env.get("NDVI")));
                    if (env.containsKey("Soil_Moisture")) record.setSoilMoisture(toDouble(env.get("Soil_Moisture")));
                }

                predictionRecordRepository.save(record);
            } catch (Exception e) {
                System.err.println("Warning: Could not save prediction record to MySQL: " + e.getMessage());
            }
        }

        return body;
    }

    public MlRecommendationDto.Response recommendCrops(MlRecommendationDto.Request request, String userEmail) {
        String url = mlServiceUrl + "/api/v1/recommend";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<MlRecommendationDto.Request> entity = new HttpEntity<>(request, headers);

        ResponseEntity<MlRecommendationDto.Response> response = restTemplate.postForEntity(url, entity, MlRecommendationDto.Response.class);
        MlRecommendationDto.Response body = response.getBody();

        if (body != null) {
            try {
                RecommendationRecord record = new RecommendationRecord();
                record.setUserEmail(userEmail != null ? userEmail : "guest@system.com");
                record.setDistrict(body.getDistrict());
                record.setSeason(body.getSeason());
                record.setYear(body.getYear());
                record.setAreaHectares(body.getArea_hectares());
                record.setAvailableCropsCount(body.getTotal_available_crops());

                if (body.getRecommendations() != null && !body.getRecommendations().isEmpty()) {
                    MlRecommendationDto.RecommendationItem top = body.getRecommendations().get(0);
                    record.setTopCrop(top.getCrop());
                    record.setTopPredictedYield(top.getPredicted_yield_tons_per_ha());
                }

                recommendationRecordRepository.save(record);
            } catch (Exception e) {
                System.err.println("Warning: Could not save recommendation record to MySQL: " + e.getMessage());
            }
        }

        return body;
    }

    public Map<String, Object> getModelPerformance() {
        String url = mlServiceUrl + "/api/v1/model-performance";
        return restTemplate.getForObject(url, Map.class);
    }

    public List<PredictionRecord> getPredictionHistory(String userEmail) {
        if (userEmail != null && !userEmail.equalsIgnoreCase("anonymousUser") && !userEmail.equalsIgnoreCase("anonymous@user.com")) {
            return predictionRecordRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
        }
        return predictionRecordRepository.findTop20ByOrderByCreatedAtDesc();
    }

    public List<RecommendationRecord> getRecommendationHistory(String userEmail) {
        if (userEmail != null && !userEmail.equalsIgnoreCase("anonymousUser") && !userEmail.equalsIgnoreCase("anonymous@user.com")) {
            return recommendationRecordRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
        }
        return recommendationRecordRepository.findTop20ByOrderByCreatedAtDesc();
    }

    private Double toDouble(Object obj) {
        if (obj instanceof Number) {
            return ((Number) obj).doubleValue();
        }
        return null;
    }
}
