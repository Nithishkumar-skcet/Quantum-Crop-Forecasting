import os
import sys

# Ensure root directory is on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi.testclient import TestClient
from ml_service.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    print("Health Check Passed:", data)


def test_metadata():
    response = client.get("/api/v1/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "Ariyalur" in data["districts"]
    assert "Kharif" in data["seasons"]
    print("Metadata Check Passed. Total Districts:", len(data["districts"]))


def test_environmental_lookup():
    response = client.get("/api/v1/environment/Ariyalur?year=2026")
    assert response.status_code == 200
    data = response.json()
    assert "Rainfall_mm" in data["environmental_features"]
    print("Environmental Lookup Passed for Ariyalur:", data["environmental_features"]["Rainfall_mm"], "mm")


def test_prediction():
    payload = {
        "state": "Tamil Nadu",
        "district": "Ariyalur",
        "crop": "Bajra",
        "season": "Kharif",
        "year": 2026,
        "area": 100.0
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_yield_tons_per_ha" in data
    print(f"Prediction Test Passed: Yield = {data['predicted_yield_tons_per_ha']} t/ha, Total = {data['total_estimated_production_tons']} tons")


def test_recommendation():
    payload = {
        "state": "Tamil Nadu",
        "district": "Ariyalur",
        "season": "Kharif",
        "year": 2026,
        "area": 10.0
    }
    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0
    top_crop = data["recommendations"][0]
    print(f"Recommendation Test Passed. Top Crop: {top_crop['crop']} with {top_crop['predicted_yield_tons_per_ha']} t/ha")


def test_model_performance():
    response = client.get("/api/v1/model-performance")
    assert response.status_code == 200
    data = response.json()
    assert len(data["models"]) == 3
    print("Model Performance Endpoint Passed.")


if __name__ == "__main__":
    print("--- Running Python ML FastAPI Service Unit Tests ---")
    test_health()
    test_metadata()
    test_environmental_lookup()
    test_prediction()
    test_recommendation()
    test_model_performance()
    print("--- ALL PYTHON ML FASTAPI TESTS PASSED SUCCESSFULLY! ---")
