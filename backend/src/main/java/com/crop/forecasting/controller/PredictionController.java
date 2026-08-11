package com.crop.forecasting.controller;

import com.crop.forecasting.dto.MlPredictionDto;
import com.crop.forecasting.service.PythonMlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @Autowired
    private PythonMlService pythonMlService;

    @PostMapping
    public ResponseEntity<?> predict(
            @RequestBody MlPredictionDto.Request request,
            Authentication authentication) {
        try {
            String email = (authentication != null) ? authentication.getName() : "anonymous@user.com";
            MlPredictionDto.Response response = pythonMlService.predictYield(request, email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication authentication) {
        String email = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(pythonMlService.getPredictionHistory(email));
    }
}
