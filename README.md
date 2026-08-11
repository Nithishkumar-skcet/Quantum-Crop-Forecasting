# Quantum-Assisted Smart Agriculture – Crop Yield Forecasting & Recommendation System

A full-stack, microservice-based smart agriculture application combining 2026 Google Earth Engine (GEE) satellite climate telemetry, classical machine learning (XGBoost, Random Forest), and experimental hybrid quantum-classical algorithms (PennyLane AngleEmbedding + PCA) to provide precise crop yield forecasting (t/ha) and intelligent crop recommendations across all 38 districts of Tamil Nadu.

---

## 🌟 Key Features

* 🌾 **Crop Yield Forecasting**: XGBoost regression model predicting yield in **tons/hectare** and estimated production in **tons** based on 19 scaled & encoded features.
* 🌱 **Intelligent Crop Recommendation**: Ranks available crops for any Tamil Nadu district and season by predicted yield. Zero fallback fabrication; displays actual matching candidate crops.
* 🌦️ **2026 GEE Climate Telemetry**: Automated lookup of 13 satellite and soil parameters (Rainfall, Temperatures, Humidity, NDVI, EVI, Soil Moisture, LST, Soil Organic Carbon, Soil pH, etc.) derived from Google Earth Engine. Zero manual weather input required from farmers.
* ⚛️ **Model Performance & Comparative Analytics**: Evaluated comparison between Random Forest Baseline (R²: 0.9547), Production XGBoost (R²: 0.9294), and Experimental Hybrid Quantum Random Forest (R²: -0.0424).
* 🔒 **Secure Authentication**: Spring Security JWT authentication with BCrypt password hashing, role-based security, and strict user-history isolation.
* 💻 **Modern Responsive UI**: React + Vite frontend with dark glassmorphism styling, interactive Recharts visualizations, district environmental snapshots, and grounded telemetry insights.

---

## 📐 System Architecture & Workflow

```
[ React + Vite Frontend ]
       │
       ▼ (JWT Auth / REST)
[ Spring Boot 3.2 Backend ] (Port 8080) ──► [ H2 / MySQL Database ]
       │
       ▼ (HTTP Proxy / DTO Mapping)
[ FastAPI ML Service ] (Port 8000)
       │
       ├─► [ 2026 GEE Telemetry Lookup ] (13 Environmental Parameters)
       ├─► [ LabelEncoders & StandardScaler ] (19 Scaled Features)
       └─► [ Frozen Production XGBoost Model ] (Yield Prediction Engine)
```

### Prediction Pipeline Flow
1. User provides: `State`, `District`, `Season`, `Crop`, `Year (2026)`, and `Area (Hectares)`.
2. Categorical encoding via `label_encoders.pkl`.
3. Automated 2026 environmental lookup from `Environmental_2026.csv` (13 parameters).
4. Feature vector assembly into exact 19-feature order.
5. Standard scaling via `scaler.pkl`.
6. XGBoost regression prediction $\rightarrow$ Yield ($t/ha$) and Total Production ($tons$).

---

## 📊 Model Performance Benchmarks

Evaluated on the test dataset in notebook `notebooks/06_quantum_model.ipynb`:

| Model Architecture | Type | MAE (t/ha) | RMSE (t/ha) | R² Score | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Random Forest Regressor** | Classical ML (Ensemble) | `0.350734` | `0.700260` | `0.954726` | Evaluated Baseline |
| **XGBoost Regressor** | Classical ML (Boosting) | `0.426647` | `0.874159` | `0.929448` | **Production Active** |
| **Hybrid Quantum Random Forest** | Hybrid Quantum-Classical | `2.195334` | `3.360156` | `-0.042424` | Experimental (PennyLane + PCA) |

> **Academic Note on Quantum Performance**: The Hybrid Quantum Random Forest uses Principal Component Analysis (PCA) to compress 19 features into 4 principal components, maps them onto a 4-qubit PennyLane circuit using `AngleEmbedding` and `BasicEntanglerLayers`, and feeds state measurements into a Random Forest regressor. As expected for compressed tabular data, classical models currently outperform quantum feature map compression on this dataset.

---

## 🎯 Verification Benchmark (Parity Standard)

To verify zero pipeline drift across backend microservice releases:

- **State**: Tamil Nadu
- **District**: Ariyalur
- **Season**: Kharif
- **Crop**: Bajra
- **Year**: 2026
- **Area**: 100 Hectares
- **Verified Prediction**: **3.07 t/ha** (**307.0 tons total production**)

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Lucide Icons, Recharts, Vanilla CSS (Glassmorphic Theme).
* **Backend**: Spring Boot 3.2.3, Java 21, Spring Security, JWT (JJWT 0.12.5), Spring Data JPA, H2 / MySQL.
* **ML Service**: Python 3.11, FastAPI, Uvicorn, Scikit-Learn 1.4+, XGBoost 2.0+, PennyLane 0.35+, Pandas, NumPy.
* **Data Sources**: Google Earth Engine (GEE), OpenLandMap / SoilGrids, NASA POWER.

---

## 🚀 Quick Start Guide

### 1. Python ML Service (FastAPI)
```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start Uvicorn FastAPI server on port 8000
python -m uvicorn ml_service.main:app --host 127.0.0.1 --port 8000
```

### 2. Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
# Server starts on http://localhost:8080
```

### 3. React Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:5173
```

---

## 🧪 Running Verification & Tests

### Backend Maven Tests
```bash
cd backend
mvn clean compile test
```

### Python End-to-End Parity Verification
```bash
python verify_parity.py
```

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 📜 License & Compliance

Developed as an academic research prototype. All ML models, scalers, encoders, and datasets are preserved and frozen as verified production baselines.
