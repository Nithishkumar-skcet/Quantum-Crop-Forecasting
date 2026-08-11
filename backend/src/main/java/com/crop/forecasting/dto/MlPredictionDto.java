package com.crop.forecasting.dto;

import java.util.Map;

public class MlPredictionDto {

    public static class Request {
        private String state = "Tamil Nadu";
        private String district;
        private String crop;
        private String season;
        private Integer year = 2026;
        private Double area = 1.0;

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }

        public String getCrop() { return crop; }
        public void setCrop(String crop) { this.crop = crop; }

        public String getSeason() { return season; }
        public void setSeason(String season) { this.season = season; }

        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }

        public Double getArea() { return area; }
        public void setArea(Double area) { this.area = area; }
    }

    public static class Response {
        private String state;
        private String district;
        private String crop;
        private String season;
        private Integer year;
        private Double area_hectares;
        private Double predicted_yield_tons_per_ha;
        private Double total_estimated_production_tons;
        private Map<String, Object> environmental_features;

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }

        public String getCrop() { return crop; }
        public void setCrop(String crop) { this.crop = crop; }

        public String getSeason() { return season; }
        public void setSeason(String season) { this.season = season; }

        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }

        public Double getArea_hectares() { return area_hectares; }
        public void setArea_hectares(Double area_hectares) { this.area_hectares = area_hectares; }

        public Double getPredicted_yield_tons_per_ha() { return predicted_yield_tons_per_ha; }
        public void setPredicted_yield_tons_per_ha(Double predicted_yield_tons_per_ha) { this.predicted_yield_tons_per_ha = predicted_yield_tons_per_ha; }

        public Double getTotal_estimated_production_tons() { return total_estimated_production_tons; }
        public void setTotal_estimated_production_tons(Double total_estimated_production_tons) { this.total_estimated_production_tons = total_estimated_production_tons; }

        public Map<String, Object> getEnvironmental_features() { return environmental_features; }
        public void setEnvironmental_features(Map<String, Object> environmental_features) { this.environmental_features = environmental_features; }
    }
}
