# Quantum Crop Forecasting

This repository is a starter scaffold for a student project that forecasts crop production or yield using agricultural data.

The project flow is:
- collect datasets
- clean and merge them
- explore the data
- build a classical baseline model
- build a hybrid quantum model
- compare the results

## What You Will Build

- `datasets/raw/`: original downloaded CSV files
- `datasets/processed/`: cleaned and merged files
- `notebooks/01_Data_Collection.ipynb`: load and inspect the first dataset
- `notebooks/02_Data_Preprocessing.ipynb`: clean and prepare the data
- `notebooks/03_EDA.ipynb`: charts, summaries, and patterns
- `notebooks/04_LSTM_Model.ipynb`: classical sequence model
- `notebooks/05_Quantum_LSTM.ipynb`: hybrid quantum-classical model
- `notebooks/06_Model_Comparison.ipynb`: compare all model scores
- `notebooks/07_Multimodal_Model.ipynb`: weather + soil + NDVI + farm-input model

## Recommended Starting Point

Start with one dataset only:
- the FAOSTAT crop yield file in `datasets/raw/faostat_crop_yield_india.csv`

After that works, add:
- weather data
- soil data
- NDVI or vegetation data
- irrigation and fertilizer inputs

Do not try to finish all datasets at once. Build the pipeline one phase at a time.

Note:
- This FAOSTAT file is India-wide, not Tamil Nadu-specific.
- It is still a strong starter dataset for the project pipeline, preprocessing, and model comparison.

## Dataset Sources

Use these official sources as your starting point:
- Crop production or yield: [Open Government Data Portal India](https://www.data.gov.in/) or [FAOSTAT production data](https://www.fao.org/faostat/en/#data/QCL)
- Weather: [NASA POWER Data Access Viewer](https://power.larc.nasa.gov/data-access-viewer/) and [NASA POWER API docs](https://power.larc.nasa.gov/docs/services/api/)
- Soil: [SoilGrids](https://isric.org/explore/soilgrids) and [ISRIC Data Hub](https://data.isric.org/geonetwork/srv/eng/catalog.search)
- NDVI: [MOD13Q1 NDVI product](https://www.earthdata.nasa.gov/data/catalog/lpcloud-mod13q1-061) and [Earthdata Search](https://search.earthdata.nasa.gov/)
- Irrigation and fertilizer: use state or district agriculture statistics from [data.gov.in](https://www.data.gov.in/) or your state agriculture department portal

Suggested search terms:
- `crop production`
- `district wise crop production`
- `area production yield`
- `rainfall temperature humidity`
- `soil properties`
- `NDVI MODIS`

## Project Roadmap

### 1. Setup
- Keep the virtual environment in `venv/`
- Install dependencies from `requirements.txt`
- Open Jupyter and confirm imports work

### 2. Data Collection
- Put the first CSV in `datasets/raw/`
- Check the column names, row count, and missing values
- Decide the prediction target

### 3. Preprocessing
- Standardize column names
- Handle missing values
- Remove duplicates
- Convert data types
- Save the cleaned result to `datasets/processed/`

### 4. EDA
- Study the target distribution
- Check correlations and season trends
- Compare states, crops, and years if they exist

### 5. Baseline Model
- Start with a simple classical model first
- Build an LSTM only after the table is ready for sequence learning

### 6. Quantum Model
- Keep the quantum circuit small
- Use a few compressed features as input
- Compare it against the classical baseline

### 7. Multimodal Model
- Merge weather, soil, NDVI, irrigation, and fertilizer into one table
- Keep a geographic key such as state or district
- Use one branch for historical yield and one branch for the extra features
- If real sources are unavailable, generate synthetic feature columns from the yield table for a demo run

### 8. Comparison
- Report MAE, RMSE, and R2
- Add one comparison table and one comparison chart
- Write a short conclusion about which model worked best

## Suggested Team Split

- Member 1: dataset collection and cleaning
- Member 2: EDA and visualizations
- Member 3: LSTM and hybrid quantum model
- Member 4: report, slides, and demo

## Quick Start

Run these commands in the project folder:

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
jupyter notebook
```

If `pip` gives trouble on Windows, use `python -m pip` instead.
If you are using `cmd.exe` instead of PowerShell, activate with `venv\Scripts\activate.bat`.

## What To Aim For

By the end, you should have:
- one clean dataset
- one working baseline model
- one quantum or hybrid model
- one multimodal model with weather/soil/NDVI/features
- one comparison notebook
- one short report and presentation

## Keep In Mind

- Keep raw data untouched
- Save cleaned data separately
- Use consistent file names
- Test each notebook before moving forward
- Document what each dataset contains
