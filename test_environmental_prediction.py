from app.predictor import get_environmental_data, predict_yield


# ---------------------------------------
# Test 2026 environmental data
# ---------------------------------------

district = "Ariyalur"
year = 2026

environment = get_environmental_data(
    district,
    year
)

print("\n2026 Environmental Data")
print("------------------------")

for key, value in environment.items():
    print(f"{key}: {value}")


# ---------------------------------------
# Create complete model input
# ---------------------------------------

sample = {
    "State": "Tamil Nadu",
    "District": district,
    "Year": year,
    "Crop": "Bajra",
    "Season": "Kharif",
    "Area": 100.0
}

# Add environmental features
sample.update(environment)


# ---------------------------------------
# Predict
# ---------------------------------------

prediction = predict_yield(sample)

print("\n------------------------")
print(f"Predicted Yield: {prediction:.2f} tons/hectare")