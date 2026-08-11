from app.predictor import predict_yield

sample = {
    "State": "Tamil Nadu",
    "District": "Ariyalur",
    "Year": 2022,
    "Crop": "Bajra",
    "Season": "Kharif",
    "Area": 100,

    "Rainfall_mm": 1547.37,
    "Avg_Temperature_C": 27.96,
    "Max_Temperature_C": 35.40,
    "Min_Temperature_C": 21.80,
    "Relative_Humidity_Percent": 67.90,

    "NDVI": 0.49,
    "EVI": 0.31,
    "LST_C": 35.80,
    "Soil_Moisture": 0.30,
    "Evapotranspiration_mm": 12.98,
    "Solar_Radiation_MJ": 560.21,
    "Soil_Organic_Carbon": 2.01,
    "Soil_pH": 6.5
}

prediction = predict_yield(sample)

print(f"Predicted Yield: {prediction:.2f} tons/hectare")