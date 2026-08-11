package com.crop.forecasting.controller;

import com.crop.forecasting.dto.MlRecommendationDto;
import com.crop.forecasting.service.PythonMlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private PythonMlService pythonMlService;

    @PostMapping
    public ResponseEntity<?> recommend(
            @RequestBody MlRecommendationDto.Request request,
            Authentication authentication) {
        try {
            String email = (authentication != null) ? authentication.getName() : "anonymous@user.com";
            MlRecommendationDto.Response response = pythonMlService.recommendCrops(request, email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication authentication) {
        String email = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(pythonMlService.getRecommendationHistory(email));
    }
}
