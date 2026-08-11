package com.crop.forecasting;

import com.crop.forecasting.dto.MlPredictionDto;
import com.crop.forecasting.dto.MlRecommendationDto;
import com.crop.forecasting.service.PythonMlService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ParityVerificationTest {

    @Autowired
    private PythonMlService pythonMlService;

    @Test
    public void testPredictionAndRecommendationParity() {
        System.out.println("======================================================================");
        System.out.println("   SPRING BOOT LAYER 3 PARITY TEST");
        System.out.println("======================================================================");

        // 1. Test Prediction
        MlPredictionDto.Request predReq = new MlPredictionDto.Request();
        predReq.setState("Tamil Nadu");
        predReq.setDistrict("Ariyalur");
        predReq.setCrop("Bajra");
        predReq.setSeason("Kharif");
        predReq.setYear(2026);
        predReq.setArea(100.0);

        MlPredictionDto.Response predResp = pythonMlService.predictYield(predReq, "test@verification.com");
        assertNotNull(predResp);
        assertEquals(3.07, predResp.getPredicted_yield_tons_per_ha(), 0.01);
        assertEquals(307.0, predResp.getTotal_estimated_production_tons(), 0.01);

        System.out.println("Layer 3 Prediction Success: " + predResp.getPredicted_yield_tons_per_ha() + " t/ha (" + predResp.getTotal_estimated_production_tons() + " tons)");

        // 2. Test Recommendation
        MlRecommendationDto.Request recReq = new MlRecommendationDto.Request();
        recReq.setState("Tamil Nadu");
        recReq.setDistrict("Ariyalur");
        recReq.setSeason("Kharif");
        recReq.setYear(2026);
        recReq.setArea(100.0);

        MlRecommendationDto.Response recResp = pythonMlService.recommendCrops(recReq, "test@verification.com");
        assertNotNull(recResp);
        assertTrue(recResp.getRecommendations().size() > 0);
        
        MlRecommendationDto.RecommendationItem top = recResp.getRecommendations().get(0);
        assertEquals("Onion", top.getCrop());

        System.out.println("Layer 3 Recommendation Top Crop Success: " + top.getCrop() + " -> " + top.getPredicted_yield_tons_per_ha() + " t/ha");
        System.out.println("======================================================================");
    }
}
