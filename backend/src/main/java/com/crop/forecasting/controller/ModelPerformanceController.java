package com.crop.forecasting.controller;

import com.crop.forecasting.service.PythonMlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/model-performance")
public class ModelPerformanceController {

    @Autowired
    private PythonMlService pythonMlService;

    @GetMapping
    public ResponseEntity<?> getModelPerformance() {
        return ResponseEntity.ok(pythonMlService.getModelPerformance());
    }
}
