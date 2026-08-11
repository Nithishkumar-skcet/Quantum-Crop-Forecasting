import joblib
import pandas as pd


# --------------------------------------------------
# Load trained model and preprocessing objects
# --------------------------------------------------

model = joblib.load("models/xgboost_model.pkl")
scaler = joblib.load("models/scaler.pkl")
label_encoders = joblib.load("models/label_encoders.pkl")


# --------------------------------------------------
# Load latest environmental data
# --------------------------------------------------

ENVIRONMENTAL_DATA_PATH = "notebooks/datasets/processed/Environmental_2026.csv"


environmental_data = pd.read_csv(ENVIRONMENTAL_DATA_PATH)


# --------------------------------------------------
# Get environmental data for a district and year
# --------------------------------------------------

def get_environmental_data(district, year=2026):
    """
    Get environmental and soil features for a district.

    Parameters
    ----------
    district : str
        District name.
    year : int
        Year of environmental data.

    Returns
    -------
    dict
        Environmental and soil features.
    """

    data = environmental_data[
        (environmental_data["District"] == district) &
        (environmental_data["Year"] == year)
    ]

    if data.empty:
        raise ValueError(
            f"No environmental data found for {district}, {year}"
        )

    row = data.iloc[0]

    return {
        "Rainfall_mm": row["Rainfall_mm"],
        "Avg_Temperature_C": row["Avg_Temperature_C"],
        "Max_Temperature_C": row["Max_Temperature_C"],
        "Min_Temperature_C": row["Min_Temperature_C"],
        "Relative_Humidity_Percent": row["Relative_Humidity_Percent"],
        "NDVI": row["NDVI"],
        "EVI": row["EVI"],
        "LST_C": row["LST_C"],
        "Soil_Moisture": row["Soil_Moisture"],
        "Evapotranspiration_mm": row["Evapotranspiration_mm"],
        "Solar_Radiation_MJ": row["Solar_Radiation_MJ"],
        "Soil_Organic_Carbon": row["Soil_Organic_Carbon"],
        "Soil_pH": row["Soil_pH"]
    }


# --------------------------------------------------
# Predict crop yield
# --------------------------------------------------

def predict_yield(input_data):
    """
    Predict crop yield using the existing trained model.

    The input_data dictionary must contain the same
    19 features used during model training.
    """

    df = pd.DataFrame([input_data])

    categorical_columns = [
        "State",
        "District",
        "Crop",
        "Season"
    ]

    # Encode categorical features
    for col in categorical_columns:
        df[col] = label_encoders[col].transform(df[col])

    # Apply existing scaler
    df_scaled = scaler.transform(df)

    # Existing trained XGBoost model
    prediction = model.predict(df_scaled)[0]

    return float(prediction)