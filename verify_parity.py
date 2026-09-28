import os
import sys
import json
import pandas as pd

# Ensure root directory is on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.predictor import get_environmental_data, predict_yield
from app.recommender import recommend_crops
from fastapi.testclient import TestClient
from ml_service.main import app as fastapi_app

client = TestClient(fastapi_app)

def run_parity_verification():
    print("=" * 70)
    print("      END-TO-END PARITY VERIFICATION REPORT")
    print("=" * 70)

    district = "Ariyalur"
    season = "Kharif"
    crop = "Bajra"
    year = 2026
    area = 100.0

    # ----------------------------------------------------
    # LAYER 1: DIRECT PYTHON ML IMPLEMENTATION
    # ----------------------------------------------------
    print("\n--- [LAYER 1] Existing Python ML Implementation ---")
    env_2026 = get_environmental_data(district, year)
    
    sample_predict_l1 = {
        "State": "Tamil Nadu",
        "District": district,
        "Year": year,
        "Crop": crop,
        "Season": season,
        "Area": area
    }
    sample_predict_l1.update(env_2026)

    pred_l1_raw = predict_yield(sample_predict_l1)
    pred_l1_rounded = round(float(pred_l1_raw), 2)
    tot_l1 = round(pred_l1_rounded * area, 2)
    print(f"Layer 1 Yield Prediction: {pred_l1_rounded} tons/ha (Raw: {pred_l1_raw})")
    print(f"Layer 1 Total Production ({area} ha): {tot_l1} tons")

    # Layer 1 Recommendation
    df_dataset = pd.read_csv(os.path.join(PROJECT_ROOT, "notebooks", "datasets", "processed", "Final_Crop_Yield_Dataset.csv"))
    avail_crops_l1 = sorted(
        df_dataset[
            (df_dataset["District"] == district) &
            (df_dataset["Season"] == season)
        ]["Crop"].dropna().unique().tolist()
    )

    sample_rec_l1 = {
        "State": "Tamil Nadu",
        "District": district,
        "Year": year,
        "Crop": "",
        "Season": season,
        "Area": area
    }
    sample_rec_l1.update(env_2026)

    recs_l1_df = recommend_crops(sample_rec_l1, avail_crops_l1)
    print("\nLayer 1 Crop Recommendations:")
    for idx, row in recs_l1_df.iterrows():
        print(f"  #{idx+1}: {row['Crop']} -> {row['Predicted Yield']} t/ha")


    # ----------------------------------------------------
    # LAYER 2: FASTAPI /api/v1/predict & /api/v1/recommend
    # ----------------------------------------------------
    print("\n--- [LAYER 2] FastAPI REST API Services ---")
    
    # Prediction Endpoint
    pred_payload = {
        "state": "Tamil Nadu",
        "district": district,
        "crop": crop,
        "season": season,
        "year": year,
        "area": area
    }
    resp_pred_l2 = client.post("/api/v1/predict", json=pred_payload)
    assert resp_pred_l2.status_code == 200, f"FastAPI Predict Error: {resp_pred_l2.text}"
    data_pred_l2 = resp_pred_l2.json()
    pred_l2_yield = data_pred_l2["predicted_yield_tons_per_ha"]
    pred_l2_tot = data_pred_l2["total_estimated_production_tons"]
    print(f"Layer 2 Yield Prediction: {pred_l2_yield} tons/ha")
    print(f"Layer 2 Total Production ({area} ha): {pred_l2_tot} tons")

    # Recommendation Endpoint
    rec_payload = {
        "state": "Tamil Nadu",
        "district": district,
        "season": season,
        "year": year,
        "area": area
    }
    resp_rec_l2 = client.post("/api/v1/recommend", json=rec_payload)
    assert resp_rec_l2.status_code == 200, f"FastAPI Recommend Error: {resp_rec_l2.text}"
    data_rec_l2 = resp_rec_l2.json()
    print("\nLayer 2 Crop Recommendations:")
    for item in data_rec_l2["recommendations"]:
        print(f"  #{item['rank']}: {item['crop']} -> {item['predicted_yield_tons_per_ha']} t/ha")


    # ----------------------------------------------------
    # PARITY COMPARISON (LAYER 1 vs LAYER 2)
    # ----------------------------------------------------
    print("\n" + "=" * 70)
    print("PARITY COMPARISON CHECK (Layer 1 vs Layer 2):")
    
    pred_match = (pred_l1_rounded == pred_l2_yield) and (tot_l1 == pred_l2_tot)
    print(f"Yield Prediction Parity: {'MATCH [OK]' if pred_match else 'MISMATCH [FAIL]'}")

    rec_match = True
    for idx, row in recs_l1_df.iterrows():
        l2_item = data_rec_l2["recommendations"][idx]
        if row["Crop"] != l2_item["crop"] or row["Predicted Yield"] != l2_item["predicted_yield_tons_per_ha"]:
            rec_match = False
            break
    print(f"Crop Recommendation Parity: {'MATCH [OK]' if rec_match else 'MISMATCH [FAIL]'}")
    print("=" * 70)

if __name__ == "__main__":
    run_parity_verification()
