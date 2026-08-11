package com.crop.forecasting.dto;

import java.util.List;
import java.util.Map;

public class MlRecommendationDto {

    public static class Request {
        private String state = "Tamil Nadu";
        private String district;
        private String season;
        private Integer year = 2026;
        private Double area = 1.0;

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }

        public String getSeason() { return season; }
        public void setSeason(String season) { this.season = season; }

        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }

        public Double getArea() { return area; }
        public void setArea(Double area) { this.area = area; }
    }

    public static class RecommendationItem {
        private String crop;
        private Double predicted_yield_tons_per_ha;
        private Double total_estimated_production_tons;
        private Integer rank;

        public String getCrop() { return crop; }
        public void setCrop(String crop) { this.crop = crop; }

        public Double getPredicted_yield_tons_per_ha() { return predicted_yield_tons_per_ha; }
        public void setPredicted_yield_tons_per_ha(Double predicted_yield_tons_per_ha) { this.predicted_yield_tons_per_ha = predicted_yield_tons_per_ha; }

        public Double getTotal_estimated_production_tons() { return total_estimated_production_tons; }
        public void setTotal_estimated_production_tons(Double total_estimated_production_tons) { this.total_estimated_production_tons = total_estimated_production_tons; }

        public Integer getRank() { return rank; }
        public void setRank(Integer rank) { this.rank = rank; }
    }

    public static class Response {
        private String district;
        private String season;
        private Integer year;
        private Double area_hectares;
        private Integer total_available_crops;
        private Map<String, Object> environmental_features;
        private List<RecommendationItem> recommendations;

        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }

        public String getSeason() { return season; }
        public void setSeason(String season) { this.season = season; }

        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }

        public Double getArea_hectares() { return area_hectares; }
        public void setArea_hectares(Double area_hectares) { this.area_hectares = area_hectares; }

        public Integer getTotal_available_crops() { return total_available_crops; }
        public void setTotal_available_crops(Integer total_available_crops) { this.total_available_crops = total_available_crops; }

        public Map<String, Object> getEnvironmental_features() { return environmental_features; }
        public void setEnvironmental_features(Map<String, Object> environmental_features) { this.environmental_features = environmental_features; }

        public List<RecommendationItem> getRecommendations() { return recommendations; }
        public void setRecommendations(List<RecommendationItem> recommendations) { this.recommendations = recommendations; }
    }
}
