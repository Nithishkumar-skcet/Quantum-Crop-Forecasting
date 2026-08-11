import pandas as pd

from app.recommender import recommend_crops

df = pd.read_csv("notebooks/datasets/processed/Final_Crop_Yield_Dataset.csv")

crop_list = sorted(df["Crop"].unique())

sample = {
    "State": "Tamil Nadu",
    "District": "Ariyalur",
    "Year": 2022,
    "Crop": "",
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

recommendations = recommend_crops(sample, crop_list)

print(recommendations.head(5))