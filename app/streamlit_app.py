
import streamlit as st
import pandas as pd

from predictor import predict_yield, get_environmental_data
from recommender import recommend_crops


# ============================================================
# PAGE CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="Quantum Crop Forecasting",
    page_icon="🌾",
    layout="wide"
)


# ============================================================
# LOAD DATASET
# ============================================================

df = pd.read_csv(
    "notebooks/datasets/processed/Final_Crop_Yield_Dataset.csv"
)


# Available crops, districts and seasons
crop_list = sorted(
    df["Crop"].dropna().unique()
)

district_list = sorted(
    df["District"].dropna().unique()
)

season_list = sorted(
    df["Season"].dropna().unique()
)


# ============================================================
# TITLE
# ============================================================

st.title("🌾 Quantum-Assisted Smart Agriculture")

st.subheader(
    "Crop Yield Forecasting & Crop Recommendation System"
)

st.markdown("---")


# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.title("🌾 Navigation")

page = st.sidebar.radio(
    "Select Module",
    [
        "Home",
        "Yield Prediction",
        "Crop Recommendation",
        "Model Performance",
        "About"
    ]
)


# ============================================================
# HOME
# ============================================================

if page == "Home":

    st.header("🌾 Welcome")

    st.write(
        """
        This system predicts crop yield using historical crop,
        environmental and soil data.

        The system also recommends suitable crops based on
        the predicted yield under the latest environmental
        conditions.
        """
    )

    st.info(
        "🌍 Environmental and soil conditions for 2026 are "
        "automatically obtained from the prepared GEE dataset."
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric(
            "Districts",
            "38"
        )

    with col2:
        st.metric(
            "Prediction Year",
            "2026"
        )

    with col3:
        st.metric(
            "Model",
            "XGBoost"
        )


# ============================================================
# YIELD PREDICTION
# ============================================================

elif page == "Yield Prediction":

    st.header("🌾 Crop Yield Prediction")

    st.write(
        """
        Select the location, crop and season.
        Environmental and soil parameters are automatically
        obtained from the 2026 dataset.
        """
    )

    # --------------------------------------------------------
    # Basic user inputs
    # --------------------------------------------------------

    state = st.selectbox(
        "State",
        ["Tamil Nadu"]
    )

    district = st.selectbox(
        "District",
        district_list
    )

    # Only crops available in selected district
    filtered_crops = sorted(
        df[
            df["District"] == district
        ]["Crop"].dropna().unique()
    )

    crop = st.selectbox(
        "Crop",
        filtered_crops
    )

    season = st.selectbox(
        "Season",
        season_list
    )

    year = 2026

    area = st.number_input(
        "Area (hectares)",
        min_value=0.1,
        value=1.0,
        step=0.1
    )

    st.markdown("---")

    # --------------------------------------------------------
    # Automatically obtain 2026 environmental data
    # --------------------------------------------------------

    try:

        environment = get_environmental_data(
            district,
            year
        )

        st.subheader("🌦️ 2026 Environmental Conditions")

        col1, col2, col3 = st.columns(3)

        with col1:

            st.metric(
                "Rainfall",
                f"{environment['Rainfall_mm']:.2f} mm"
            )

            st.metric(
                "Average Temperature",
                f"{environment['Avg_Temperature_C']:.2f} °C"
            )

            st.metric(
                "Maximum Temperature",
                f"{environment['Max_Temperature_C']:.2f} °C"
            )

            st.metric(
                "Minimum Temperature",
                f"{environment['Min_Temperature_C']:.2f} °C"
            )

        with col2:

            st.metric(
                "Humidity",
                f"{environment['Relative_Humidity_Percent']:.2f} %"
            )

            st.metric(
                "NDVI",
                f"{environment['NDVI']:.3f}"
            )

            st.metric(
                "EVI",
                f"{environment['EVI']:.3f}"
            )

            st.metric(
                "Land Surface Temperature",
                f"{environment['LST_C']:.2f} °C"
            )

        with col3:

            st.metric(
                "Soil Moisture",
                f"{environment['Soil_Moisture']:.3f}"
            )

            st.metric(
                "Evapotranspiration",
                f"{environment['Evapotranspiration_mm']:.2f} mm"
            )

            st.metric(
                "Solar Radiation",
                f"{environment['Solar_Radiation_MJ']:.2f}"
            )

            st.metric(
                "Soil Organic Carbon",
                f"{environment['Soil_Organic_Carbon']:.2f}"
            )

            st.metric(
                "Soil pH",
                f"{environment['Soil_pH']:.2f}"
            )

        st.markdown("---")

        # ----------------------------------------------------
        # Prediction button
        # ----------------------------------------------------

        if st.button(
            "🌾 Predict Yield",
            use_container_width=True
        ):

            sample = {
                "State": state,
                "District": district,
                "Year": year,
                "Crop": crop,
                "Season": season,
                "Area": area
            }

            # Add automatically obtained environmental features
            sample.update(environment)

            prediction = predict_yield(sample)

            st.success(
                "Prediction Successful!"
            )

            st.metric(
                label="🌾 Predicted Yield",
                value=f"{prediction:.2f} tons/hectare"
            )

    except Exception as e:

        st.error(
            f"Unable to obtain environmental data: {e}"
        )


# ============================================================
# CROP RECOMMENDATION
# ============================================================

elif page == "Crop Recommendation":

    st.header("🌱 Crop Recommendation System")

    st.write(
        """
        Select a district and season. The system evaluates
        available crops using the 2026 environmental conditions
        and recommends the crops with the highest predicted yield.
        """
    )

    state = "Tamil Nadu"

    # --------------------------------------------------------
    # User inputs
    # --------------------------------------------------------

    district = st.selectbox(
        "District",
        district_list,
        key="rec_district"
    )

    season = st.selectbox(
        "Season",
        season_list,
        key="rec_season"
    )

    year = 2026

    area = st.number_input(
        "Area (hectares)",
        min_value=0.1,
        value=1.0,
        step=0.1,
        key="rec_area"
    )

    st.markdown("---")

    # --------------------------------------------------------
    # Automatically obtain environmental data
    # --------------------------------------------------------

    try:

        environment = get_environmental_data(
            district,
            year
        )

        st.subheader("🌦️ 2026 Environmental Conditions")

        col1, col2, col3 = st.columns(3)

        with col1:

            st.metric(
                "Rainfall",
                f"{environment['Rainfall_mm']:.2f} mm"
            )

            st.metric(
                "Average Temperature",
                f"{environment['Avg_Temperature_C']:.2f} °C"
            )

            st.metric(
                "Maximum Temperature",
                f"{environment['Max_Temperature_C']:.2f} °C"
            )

            st.metric(
                "Minimum Temperature",
                f"{environment['Min_Temperature_C']:.2f} °C"
            )

        with col2:

            st.metric(
                "Humidity",
                f"{environment['Relative_Humidity_Percent']:.2f} %"
            )

            st.metric(
                "NDVI",
                f"{environment['NDVI']:.3f}"
            )

            st.metric(
                "EVI",
                f"{environment['EVI']:.3f}"
            )

            st.metric(
                "LST",
                f"{environment['LST_C']:.2f} °C"
            )

        with col3:

            st.metric(
                "Soil Moisture",
                f"{environment['Soil_Moisture']:.3f}"
            )

            st.metric(
                "Evapotranspiration",
                f"{environment['Evapotranspiration_mm']:.2f} mm"
            )

            st.metric(
                "Solar Radiation",
                f"{environment['Solar_Radiation_MJ']:.2f}"
            )

            st.metric(
                "Soil Organic Carbon",
                f"{environment['Soil_Organic_Carbon']:.2f}"
            )

            st.metric(
                "Soil pH",
                f"{environment['Soil_pH']:.2f}"
            )

        st.markdown("---")

        # ----------------------------------------------------
        # Find available crops
        # ----------------------------------------------------

        available_crops = sorted(
            df[
                (df["District"] == district) &
                (df["Season"] == season)
            ]["Crop"].dropna().unique()
        )

        st.info(
            f"🌱 {len(available_crops)} crops available "
            f"for {district} during {season}."
        )

        # ----------------------------------------------------
        # Recommendation
        # ----------------------------------------------------

        if st.button(
            "🌱 Recommend Best Crops",
            use_container_width=True
        ):

            if len(available_crops) == 0:

                st.warning(
                    "No crops are available for this "
                    "district and season."
                )

            else:

                sample = {
                    "State": state,
                    "District": district,
                    "Year": year,
                    "Crop": "",
                    "Season": season,
                    "Area": area
                }

                # Add 2026 environmental data
                sample.update(environment)

                recommendations = recommend_crops(
                    sample,
                    available_crops
                )

                st.subheader(
                    "🏆 Recommended Crops"
                )

                top3 = recommendations.head(3)

                # ------------------------------------------------
                # Top recommendation cards
                # ------------------------------------------------

                cols = st.columns(3)

                for i, (_, row) in enumerate(
                    top3.iterrows()
                ):

                    with cols[i]:

                        if i == 0:
                            st.success("🥇 BEST CROP")
                        elif i == 1:
                            st.info("🥈 SECOND BEST")
                        else:
                            st.warning("🥉 THIRD BEST")

                        st.metric(
                            label=row["Crop"],
                            value=(
                                f"{row['Predicted Yield']:.2f} "
                                "t/ha"
                            )
                        )

                st.markdown("---")

                st.subheader(
                    "📊 Complete Recommendation Ranking"
                )

                st.dataframe(
                    recommendations,
                    use_container_width=True
                )

    except Exception as e:

        st.error(
            f"Unable to obtain environmental data: {e}"
        )


# ============================================================
# MODEL PERFORMANCE
# ============================================================

elif page == "Model Performance":

    st.header("📊 Model Performance")

    st.write(
        "Performance obtained during model evaluation."
    )

    performance = pd.DataFrame({
        "Model": [
            "Random Forest",
            "XGBoost",
            "Hybrid Quantum RF"
        ],
        "MAE": [
            0.3507,
            0.3507,
            "-"
        ],
        "RMSE": [
            0.7003,
            0.7003,
            "-"
        ],
        "R²": [
            0.9547,
            0.9547,
            "-"
        ]
    })

    st.dataframe(
        performance,
        use_container_width=True
    )

    st.info(
        "XGBoost is currently used as the main production "
        "prediction model."
    )


# ============================================================
# ABOUT
# ============================================================

elif page == "About":

    st.header("ℹ️ About Project")

    st.write(
        """
        ### Quantum-Assisted Smart Agriculture

        This project predicts crop yield using a combination
        of crop information, environmental conditions and
        soil parameters.

        ### Technologies

        - Python
        - Pandas
        - Scikit-learn
        - XGBoost
        - Random Forest
        - PennyLane
        - Streamlit
        - Google Earth Engine

        ### Data Sources

        - Tamil Nadu crop yield data
        - Google Earth Engine environmental data
        - Soil parameters

        ### 2026 Environmental Integration

        The system automatically uses the latest prepared
        2026 environmental data instead of requiring farmers
        to manually enter complex environmental parameters.

        ### Prediction Workflow

        District + Crop + Season + Area
        ↓
        2026 Environmental Data
        ↓
        Existing Preprocessing
        ↓
        Trained XGBoost Model
        ↓
        Predicted Crop Yield
        """
    )
