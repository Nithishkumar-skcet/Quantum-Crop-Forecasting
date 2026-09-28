import os
import joblib
import pandas as pd

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Load model and preprocessing objects
model = joblib.load(os.path.join(PROJECT_ROOT, "models", "xgboost_model.pkl"))
scaler = joblib.load(os.path.join(PROJECT_ROOT, "models", "scaler.pkl"))
label_encoders = joblib.load(os.path.join(PROJECT_ROOT, "models", "label_encoders.pkl"))


def recommend_crops(input_data, crop_list):

    predictions = []

    for crop in crop_list:

        sample = input_data.copy()

        sample["Crop"] = crop

        df = pd.DataFrame([sample])

        # Encode categorical features
        for col in ["State", "District", "Crop", "Season"]:
            df[col] = label_encoders[col].transform(df[col])

        # Scale features
        df_scaled = scaler.transform(df)

        # Predict yield
        predicted_yield = model.predict(df_scaled)[0]

        predictions.append({
            "Crop": crop,
            "Predicted Yield": round(float(predicted_yield), 2)
        })

    recommendations = pd.DataFrame(predictions)

    recommendations = recommendations.sort_values(
        by="Predicted Yield",
        ascending=False
    ).reset_index(drop=True)

    return recommendations