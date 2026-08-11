package com.crop.forecasting.controller;

import com.crop.forecasting.service.PythonMlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class MetadataController {

    @Autowired
    private PythonMlService pythonMlService;

    @GetMapping("/metadata")
    public ResponseEntity<?> getMetadata() {
        return ResponseEntity.ok(pythonMlService.getMetadata());
    }

    @GetMapping("/districts")
    public ResponseEntity<?> getDistricts() {
        Map<String, Object> meta = pythonMlService.getMetadata();
        return ResponseEntity.ok(meta.get("districts"));
    }

    @GetMapping("/crops")
    public ResponseEntity<?> getCrops() {
        Map<String, Object> meta = pythonMlService.getMetadata();
        return ResponseEntity.ok(meta.get("crops"));
    }

    @GetMapping("/seasons")
    public ResponseEntity<?> getSeasons() {
        Map<String, Object> meta = pythonMlService.getMetadata();
        return ResponseEntity.ok(meta.get("seasons"));
    }

    @GetMapping("/environment/{district}")
    public ResponseEntity<?> getEnvironment(
            @PathVariable String district,
            @RequestParam(required = false, defaultValue = "2026") Integer year) {
        return ResponseEntity.ok(pythonMlService.getEnvironmentalData(district, year));
    }
}
