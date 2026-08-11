import os
import sys
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd

# Ensure root directory is on sys.path to import app modules
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.predictor import get_environmental_data, predict_yield
from app.recommender import recommend_crops

# Initialize FastAPI App
app = FastAPI(
    title="Quantum Crop Forecasting ML API",
    description="Python ML Service providing Crop Yield Prediction, Crop Recommendation, and 2026 GEE Environmental Lookup.",
    version="1.0.0"
)

# Enable CORS for cross-origin access from Spring Boot or React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset for metadata lookup
DATASET_PATH = os.path.join(PROJECT_ROOT, "notebooks", "datasets", "processed", "Final_Crop_Yield_Dataset.csv")
if os.path.exists(DATASET_PATH):
    dataset_df = pd.read_csv(DATASET_PATH)
else:
    dataset_df = pd.DataFrame()


# ============================================================
# PYDANTIC SCHEMAS
# ============================================================

class YieldPredictionRequest(BaseModel):
    state: str = Field("Tamil Nadu", example="Tamil Nadu")
    district: str = Field(..., example="Ariyalur")
    crop: str = Field(..., example="Bajra")
    season: str = Field(..., example="Kharif")
    year: int = Field(2026, example=2026)
    area: float = Field(1.0, gt=0, example=100.0)

    # Optional manual override for environmental features
    rainfall_mm: Optional[float] = None
    avg_temperature_c: Optional[float] = None
    max_temperature_c: Optional[float] = None
    min_temperature_c: Optional[float] = None
    relative_humidity_percent: Optional[float] = None
    ndvi: Optional[float] = None
    evi: Optional[float] = None
    lst_c: Optional[float] = None
    soil_moisture: Optional[float] = None
    evapotranspiration_mm: Optional[float] = None
    solar_radiation_mj: Optional[float] = None
    soil_organic_carbon: Optional[float] = None
    soil_ph: Optional[float] = None


class YieldPredictionResponse(BaseModel):
    state: str
    district: str
    crop: str
    season: str
    year: int
    area_hectares: float
    predicted_yield_tons_per_ha: float
    total_estimated_production_tons: float
    environmental_features: Dict[str, float]


class CropRecommendationRequest(BaseModel):
    state: str = Field("Tamil Nadu", example="Tamil Nadu")
    district: str = Field(..., example="Ariyalur")
    season: str = Field(..., example="Kharif")
    year: int = Field(2026, example=2026)
    area: float = Field(1.0, gt=0, example=1.0)


class CropRecommendationItem(BaseModel):
    crop: str
    predicted_yield_tons_per_ha: float
    total_estimated_production_tons: float
    rank: int


class CropRecommendationResponse(BaseModel):
    district: str
    season: str
    year: int
    area_hectares: float
    total_available_crops: int
    environmental_features: Dict[str, float]
    recommendations: List[CropRecommendationItem]


# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "UP",
        "service": "Python ML Service",
        "model": "XGBoost Regressor",
        "environmental_dataset": "2026 GEE Dataset"
    }


@app.get("/api/v1/metadata", tags=["Metadata"])
def get_metadata():
    """Return available districts, crops, and seasons from processed dataset."""
    if dataset_df.empty:
        raise HTTPException(status_code=500, detail="Processed crop yield dataset unavailable.")

    districts = sorted(dataset_df["District"].dropna().unique().tolist())
    crops = sorted(dataset_df["Crop"].dropna().unique().tolist())
    seasons = sorted(dataset_df["Season"].dropna().unique().tolist())

    return {
        "districts": districts,
        "crops": crops,
        "seasons": seasons,
        "default_state": "Tamil Nadu",
        "default_year": 2026
    }


@app.get("/api/v1/environment/{district}", tags=["Environmental Data"])
def read_environmental_data(district: str, year: int = Query(2026)):
    """Fetch 2026 environmental data for a given district."""
    try:
        data = get_environmental_data(district, year)
        return {
            "district": district,
            "year": year,
            "environmental_features": data
        }
    except ValueError as err:
        raise HTTPException(status_code=444 if "No environmental data" in str(err) else 404, detail=str(err))
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))


@app.post("/api/v1/predict", response_model=YieldPredictionResponse, tags=["Prediction"])
def predict(req: YieldPredictionRequest):
    """Predict crop yield using 2026 environmental data and XGBoost model."""
    try:
        # Obtain environmental data if not manually provided
        if req.rainfall_mm is not None:
            env_data = {
                "Rainfall_mm": req.rainfall_mm,
                "Avg_Temperature_C": req.avg_temperature_c,
                "Max_Temperature_C": req.max_temperature_c,
                "Min_Temperature_C": req.min_temperature_c,
                "Relative_Humidity_Percent": req.relative_humidity_percent,
                "NDVI": req.ndvi,
                "EVI": req.evi,
                "LST_C": req.lst_c,
                "Soil_Moisture": req.soil_moisture,
                "Evapotranspiration_mm": req.evapotranspiration_mm,
                "Solar_Radiation_MJ": req.solar_radiation_mj,
                "Soil_Organic_Carbon": req.soil_organic_carbon,
                "Soil_pH": req.soil_ph
            }
        else:
            env_data = get_environmental_data(req.district, req.year)

        sample = {
            "State": req.state,
            "District": req.district,
            "Year": req.year,
            "Crop": req.crop,
            "Season": req.season,
            "Area": req.area
        }
        sample.update(env_data)

        predicted_yield = predict_yield(sample)
        predicted_yield_rounded = round(float(predicted_yield), 2)
        total_production = round(predicted_yield_rounded * req.area, 2)

        return YieldPredictionResponse(
            state=req.state,
            district=req.district,
            crop=req.crop,
            season=req.season,
            year=req.year,
            area_hectares=req.area,
            predicted_yield_tons_per_ha=predicted_yield_rounded,
            total_estimated_production_tons=total_production,
            environmental_features=env_data
        )

    except Exception as err:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(err)}")


@app.post("/api/v1/recommend", response_model=CropRecommendationResponse, tags=["Recommendation"])
def recommend(req: CropRecommendationRequest):
    """Recommend best crops for a given district & season using 2026 environmental features."""
    try:
        env_data = get_environmental_data(req.district, req.year)

        # Filter candidate crops strictly matching district and season
        if not dataset_df.empty:
            available_crops = sorted(
                dataset_df[
                    (dataset_df["District"] == req.district) &
                    (dataset_df["Season"] == req.season)
                ]["Crop"].dropna().unique().tolist()
            )
        else:
            available_crops = []

        if not available_crops:
            return CropRecommendationResponse(
                district=req.district,
                season=req.season,
                year=req.year,
                area_hectares=req.area,
                total_available_crops=0,
                environmental_features=env_data,
                recommendations=[]
            )

        sample = {
            "State": req.state,
            "District": req.district,
            "Year": req.year,
            "Crop": "",
            "Season": req.season,
            "Area": req.area
        }
        sample.update(env_data)

        recs_df = recommend_crops(sample, available_crops)

        items = []
        for rank, (_, row) in enumerate(recs_df.iterrows(), start=1):
            yield_val = float(row["Predicted Yield"])
            items.append(
                CropRecommendationItem(
                    crop=row["Crop"],
                    predicted_yield_tons_per_ha=yield_val,
                    total_estimated_production_tons=round(yield_val * req.area, 2),
                    rank=rank
                )
            )

        return CropRecommendationResponse(
            district=req.district,
            season=req.season,
            year=req.year,
            area_hectares=req.area,
            total_available_crops=len(available_crops),
            environmental_features=env_data,
            recommendations=items
        )

    except Exception as err:
        raise HTTPException(status_code=400, detail=f"Recommendation failed: {str(err)}")


@app.get("/api/v1/model-performance", tags=["Model Performance"])
def get_model_performance():
    """Return historical performance benchmark metrics for trained models."""
    return {
        "models": [
            {
                "name": "Random Forest Regressor",
                "mae": 0.350734,
                "rmse": 0.700260,
                "r2_score": 0.954726,
                "status": "Evaluated Baseline",
                "type": "Classical ML (Ensemble)"
            },
            {
                "name": "XGBoost Regressor",
                "mae": 0.426647,
                "rmse": 0.874159,
                "r2_score": 0.929448,
                "status": "Production Active",
                "type": "Classical ML (Gradient Boosting)"
            },
            {
                "name": "Hybrid Quantum Random Forest",
                "mae": 2.195334,
                "rmse": 3.360156,
                "r2_score": -0.042424,
                "status": "Experimental",
                "type": "Hybrid Quantum-Classical (PennyLane + PCA)"
            }
        ]
    }

