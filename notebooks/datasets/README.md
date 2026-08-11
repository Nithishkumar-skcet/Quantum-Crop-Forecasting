# Dataset Layout

Use this folder like this:

- `raw/`: original downloaded files
- `processed/`: cleaned and merged files

## Naming Guide

Suggested names:
- `faostat_crop_yield_india.csv`
- `weather_data.csv`
- `soil_data.csv`
- `ndvi_data.csv`
- `farm_inputs.csv`
- `final_training_table.csv`

## Rules

- Do not edit files in `raw/` directly
- Put cleaned outputs in `processed/`
- Keep a note of where each dataset came from
- Write down the columns and units for every file

## Good Workflow

1. Download one dataset
2. Place it in `raw/`
3. Inspect it in a notebook
4. Clean and standardize it
5. Save the cleaned version into `processed/`
6. Repeat for the next dataset

## First Dataset

Start with the FAOSTAT file copied into `raw/` as `faostat_crop_yield_india.csv`.
That gives you a working table before you add weather, soil, and NDVI data.

## Multimodal Table

For the full version of the project, prepare one merged file in `processed/` such as `multimodal_yield_dataset.csv` with columns like:

- `crop`
- `state`
- `district`
- `year`
- `yield_kg_per_ha`
- `rainfall_mm`
- `temperature_c`
- `humidity_pct`
- `ndvi_mean`
- `soil_ph`
- `soil_organic_carbon`
- `irrigation_coverage`
- `fertilizer_kg_ha`

If you have more detailed weather or satellite data, you can add more columns as long as the same geographic key and year are present.

If you cannot collect every external source, you can still create a mock multimodal table from the yield file alone for development and presentation.

## How To Merge

Use one base table and join everything onto it.

### Recommended base table
- `crop`
- `state`
- `district`
- `year`
- `yield_kg_per_ha`

### Merge rules
- Keep the same `state` and `district` spelling in every file.
- Convert all sources to the same `year` or `season_year`.
- Aggregate daily or monthly weather to yearly or seasonal values.
- Aggregate NDVI to the same yearly or seasonal window.
- Soil is usually static, so join it by `district` and repeat it across years.
- If a source only exists at `state` level, merge it on `state` + `year`.

### Suggested join order
1. Start with the yield table.
2. Join weather.
3. Join NDVI.
4. Join soil.
5. Join irrigation and fertilizer inputs.
6. Fill missing values and save the final CSV.

### Simple pandas pattern
```python
merged = yield_df.merge(weather_df, on=["state", "district", "year"], how="left")
merged = merged.merge(ndvi_df, on=["state", "district", "year"], how="left")
merged = merged.merge(soil_df, on=["state", "district"], how="left")
merged = merged.merge(input_df, on=["state", "district", "year"], how="left")
merged.to_csv("datasets/processed/multimodal_yield_dataset.csv", index=False)
```
