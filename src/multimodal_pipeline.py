from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from tensorflow import keras
from tensorflow.keras import layers

from .faostat_pipeline import (
    PROJECT_ROOT,
    QuantumLayer,
    load_clean_faostat_data,
    inverse_transform_values,
    regression_metrics,
    save_prediction_frame,
)

DEFAULT_DATA_FILE = PROJECT_ROOT / "datasets" / "processed" / "multimodal_yield_dataset.csv"
DEFAULT_LOOKBACK = 5
DEFAULT_GROUP_COLUMNS = ("state", "district", "crop")
DEFAULT_TARGET_COLUMN = "yield_kg_per_ha"
DEFAULT_TIME_COLUMN = "year"


def _normalize_column_name(column_name: str) -> str:
    normalized = re.sub(r"[^0-9a-zA-Z]+", "_", column_name.strip().lower())
    return normalized.strip("_")


def _normalize_frame_columns(frame: pd.DataFrame) -> pd.DataFrame:
    renamed = frame.copy()
    renamed.columns = [_normalize_column_name(column) for column in renamed.columns]
    return renamed


def _existing_columns(frame: pd.DataFrame, candidates: Sequence[str]) -> list[str]:
    return [column for column in candidates if column in frame.columns]


@dataclass
class MultimodalBundle:
    X_sequence_train: np.ndarray
    X_sequence_test: np.ndarray
    X_context_train: np.ndarray
    X_context_test: np.ndarray
    y_train: np.ndarray
    y_test: np.ndarray
    y_train_raw: np.ndarray
    y_test_raw: np.ndarray
    sequence_scaler: MinMaxScaler
    context_scaler: MinMaxScaler
    train_meta: pd.DataFrame
    test_meta: pd.DataFrame
    feature_columns: list[str]
    group_columns: list[str]

    @property
    def sequence_shape(self) -> tuple[int, ...]:
        return self.X_sequence_train.shape[1:]

    @property
    def context_shape(self) -> tuple[int, ...]:
        return self.X_context_train.shape[1:]


def load_multimodal_data(data_file: Path | str = DEFAULT_DATA_FILE) -> pd.DataFrame:
    data_path = Path(data_file)
    if not data_path.exists():
        raise FileNotFoundError(f"Missing multimodal dataset: {data_path}")

    frame = pd.read_csv(data_path)
    frame = _normalize_frame_columns(frame)

    required_columns = {"crop", "year", DEFAULT_TARGET_COLUMN}
    missing_columns = required_columns - set(frame.columns)
    if missing_columns:
        raise ValueError(f"Missing required columns: {sorted(missing_columns)}")

    cleaned = frame.copy()
    for column in ("crop", "state", "district"):
        if column in cleaned.columns:
            cleaned[column] = cleaned[column].astype(str).str.strip()

    cleaned["year"] = pd.to_numeric(cleaned["year"], errors="coerce")
    cleaned[DEFAULT_TARGET_COLUMN] = pd.to_numeric(cleaned[DEFAULT_TARGET_COLUMN], errors="coerce")
    cleaned = cleaned.dropna(subset=["crop", "year", DEFAULT_TARGET_COLUMN])
    cleaned = cleaned.sort_values([column for column in ("state", "district", "crop", "year") if column in cleaned.columns]).reset_index(drop=True)
    return cleaned


def infer_group_columns(frame: pd.DataFrame, preferred_columns: Sequence[str] = DEFAULT_GROUP_COLUMNS) -> list[str]:
    return _existing_columns(frame, preferred_columns)


def build_context_frame(
    frame: pd.DataFrame,
    feature_columns: Sequence[str] | None,
    time_column: str = DEFAULT_TIME_COLUMN,
    target_column: str = DEFAULT_TARGET_COLUMN,
) -> tuple[pd.DataFrame, list[str]]:
    excluded_columns = {time_column, target_column}
    if feature_columns is None:
        inferred_columns = [
            column
            for column in frame.columns
            if column not in excluded_columns and pd.api.types.is_numeric_dtype(frame[column])
        ]
    else:
        inferred_columns = [column for column in feature_columns if column in frame.columns and column not in excluded_columns]

    if not inferred_columns:
        context_frame = pd.DataFrame({"context_bias": np.zeros(len(frame), dtype=np.float32)}, index=frame.index)
        return context_frame, ["context_bias"]

    parts: list[pd.DataFrame] = []
    for column in inferred_columns:
        series = frame[column]
        if pd.api.types.is_numeric_dtype(series):
            parts.append(pd.to_numeric(series, errors="coerce").rename(column).to_frame())
        else:
            encoded = pd.get_dummies(series.fillna("missing").astype(str), prefix=column)
            parts.append(encoded)

    context_frame = pd.concat(parts, axis=1)
    context_frame = context_frame.apply(pd.to_numeric, errors="coerce")
    context_frame = context_frame.fillna(context_frame.median(numeric_only=True))
    context_frame = context_frame.fillna(0.0)
    return context_frame, list(context_frame.columns)


def build_multimodal_samples(
    frame: pd.DataFrame,
    lookback: int = DEFAULT_LOOKBACK,
    feature_columns: Sequence[str] | None = None,
    group_columns: Sequence[str] | None = None,
    time_column: str = DEFAULT_TIME_COLUMN,
    target_column: str = DEFAULT_TARGET_COLUMN,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, pd.DataFrame, list[str]]:
    working = frame.copy()
    working[time_column] = pd.to_numeric(working[time_column], errors="coerce")
    working[target_column] = pd.to_numeric(working[target_column], errors="coerce")
    working = working.dropna(subset=[time_column, target_column]).reset_index(drop=False)
    working = working.rename(columns={"index": "_source_index"})

    group_columns = _existing_columns(working, list(group_columns or infer_group_columns(working)))
    context_frame, context_columns = build_context_frame(working, feature_columns, time_column=time_column, target_column=target_column)
    context_frame = context_frame.reindex(working.index)

    sequence_windows: list[np.ndarray] = []
    target_values: list[float] = []
    context_values: list[np.ndarray] = []
    metadata_rows: list[dict[str, object]] = []

    group_iterator = working.groupby(group_columns, dropna=False, sort=False) if group_columns else [(None, working)]

    for group_key, group_frame in group_iterator:
        ordered = group_frame.sort_values(time_column)
        values = ordered[target_column].to_numpy(dtype=np.float32)
        if len(values) <= lookback:
            continue

        if group_columns:
            if not isinstance(group_key, tuple):
                group_key = (group_key,)
            group_meta = dict(zip(group_columns, group_key))
        else:
            group_meta = {}

        for index in range(lookback, len(values)):
            row_position = ordered.index[index]
            sequence_windows.append(values[index - lookback : index].reshape(lookback, 1))
            target_values.append(float(values[index]))
            context_values.append(context_frame.loc[row_position].to_numpy(dtype=np.float32))
            metadata_rows.append(
                {
                    **group_meta,
                    "target_year": int(ordered.iloc[index][time_column]),
                }
            )

    return (
        np.asarray(sequence_windows, dtype=np.float32),
        np.asarray(target_values, dtype=np.float32),
        np.asarray(context_values, dtype=np.float32),
        pd.DataFrame(metadata_rows),
        context_columns,
    )


def prepare_multimodal_bundle(
    data_file: Path | str = DEFAULT_DATA_FILE,
    lookback: int = DEFAULT_LOOKBACK,
    feature_columns: Sequence[str] | None = None,
    group_columns: Sequence[str] | None = None,
    test_size: float = 0.2,
    random_state: int = 42,
    max_samples: int | None = 2000,
) -> MultimodalBundle:
    frame = load_multimodal_data(data_file)
    group_columns = _existing_columns(frame, list(group_columns or infer_group_columns(frame)))

    X_sequence_raw, y_raw, X_context_raw, metadata, context_columns = build_multimodal_samples(
        frame,
        lookback=lookback,
        feature_columns=feature_columns,
        group_columns=group_columns,
    )

    if max_samples is not None and len(X_sequence_raw) > max_samples:
        rng = np.random.default_rng(random_state)
        indices = rng.choice(len(X_sequence_raw), size=max_samples, replace=False)
        X_sequence_raw = X_sequence_raw[indices]
        y_raw = y_raw[indices]
        X_context_raw = X_context_raw[indices]
        metadata = metadata.iloc[indices].reset_index(drop=True)

    X_sequence_train_raw, X_sequence_test_raw, y_train_raw, y_test_raw, X_context_train_raw, X_context_test_raw, train_meta, test_meta = train_test_split(
        X_sequence_raw,
        y_raw,
        X_context_raw,
        metadata,
        test_size=test_size,
        random_state=random_state,
        shuffle=True,
    )

    sequence_scaler = MinMaxScaler()
    sequence_values = np.concatenate(
        [X_sequence_train_raw.reshape(-1, 1), y_train_raw.reshape(-1, 1)],
        axis=0,
    )
    sequence_scaler.fit(sequence_values)

    context_scaler = MinMaxScaler()
    context_scaler.fit(X_context_train_raw)

    X_sequence_train = sequence_scaler.transform(X_sequence_train_raw.reshape(-1, 1)).reshape(X_sequence_train_raw.shape).astype(np.float32)
    X_sequence_test = sequence_scaler.transform(X_sequence_test_raw.reshape(-1, 1)).reshape(X_sequence_test_raw.shape).astype(np.float32)
    y_train = sequence_scaler.transform(y_train_raw.reshape(-1, 1)).reshape(-1).astype(np.float32)
    y_test = sequence_scaler.transform(y_test_raw.reshape(-1, 1)).reshape(-1).astype(np.float32)
    X_context_train = context_scaler.transform(X_context_train_raw).astype(np.float32)
    X_context_test = context_scaler.transform(X_context_test_raw).astype(np.float32)

    return MultimodalBundle(
        X_sequence_train=X_sequence_train,
        X_sequence_test=X_sequence_test,
        X_context_train=X_context_train,
        X_context_test=X_context_test,
        y_train=y_train,
        y_test=y_test,
        y_train_raw=y_train_raw.astype(np.float32),
        y_test_raw=y_test_raw.astype(np.float32),
        sequence_scaler=sequence_scaler,
        context_scaler=context_scaler,
        train_meta=train_meta.reset_index(drop=True),
        test_meta=test_meta.reset_index(drop=True),
        feature_columns=context_columns,
        group_columns=group_columns,
    )


def train_multimodal_model(
    model: keras.Model,
    X_sequence_train: np.ndarray,
    X_context_train: np.ndarray,
    y_train: np.ndarray,
    X_sequence_valid: np.ndarray,
    X_context_valid: np.ndarray,
    y_valid: np.ndarray,
    epochs: int = 10,
    batch_size: int = 32,
) -> keras.callbacks.History:
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=3,
            restore_best_weights=True,
        )
    ]
    return model.fit(
        [X_sequence_train, X_context_train],
        y_train,
        validation_data=([X_sequence_valid, X_context_valid], y_valid),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1,
        callbacks=callbacks,
    )


def build_multimodal_baseline_model(sequence_shape: tuple[int, ...], context_shape: tuple[int, ...]) -> keras.Model:
    keras.backend.clear_session()

    sequence_input = keras.Input(shape=sequence_shape, name="yield_history")
    sequence_branch = layers.LSTM(32, return_sequences=True)(sequence_input)
    sequence_branch = layers.Dropout(0.2)(sequence_branch)
    sequence_branch = layers.LSTM(16)(sequence_branch)
    sequence_branch = layers.Dense(16, activation="relu")(sequence_branch)

    context_input = keras.Input(shape=context_shape, name="context_features")
    context_branch = layers.Dense(32, activation="relu")(context_input)
    context_branch = layers.Dropout(0.2)(context_branch)
    context_branch = layers.Dense(16, activation="relu")(context_branch)

    fused = layers.Concatenate()([sequence_branch, context_branch])
    fused = layers.Dense(16, activation="relu")(fused)
    outputs = layers.Dense(1)(fused)

    model = keras.Model([sequence_input, context_input], outputs, name="multimodal_lstm")
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=1e-3), loss="mse", metrics=["mae"])
    return model


def build_multimodal_quantum_model(
    sequence_shape: tuple[int, ...],
    context_shape: tuple[int, ...],
    n_qubits: int = 4,
    n_layers: int = 2,
) -> keras.Model:
    keras.backend.clear_session()

    sequence_input = keras.Input(shape=sequence_shape, name="yield_history")
    sequence_branch = layers.LSTM(24, return_sequences=True)(sequence_input)
    sequence_branch = layers.Dropout(0.2)(sequence_branch)
    sequence_branch = layers.LSTM(12)(sequence_branch)
    sequence_branch = layers.Dense(16, activation="relu")(sequence_branch)

    context_input = keras.Input(shape=context_shape, name="context_features")
    context_branch = layers.Dense(n_qubits, activation="relu")(context_input)
    context_branch = QuantumLayer(n_qubits=n_qubits, n_layers=n_layers)(context_branch)
    context_branch = layers.Dense(8, activation="relu")(context_branch)

    fused = layers.Concatenate()([sequence_branch, context_branch])
    fused = layers.Dense(16, activation="relu")(fused)
    outputs = layers.Dense(1)(fused)

    model = keras.Model([sequence_input, context_input], outputs, name="multimodal_quantum_lstm")
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=1e-3), loss="mse", metrics=["mae"])
    return model


def run_multimodal_baseline_pipeline(
    data_file: Path | str = DEFAULT_DATA_FILE,
    lookback: int = DEFAULT_LOOKBACK,
    feature_columns: Sequence[str] | None = None,
    group_columns: Sequence[str] | None = None,
    max_samples: int | None = 2000,
    epochs: int = 10,
    batch_size: int = 32,
    random_state: int = 42,
) -> tuple[keras.Model, MultimodalBundle, dict[str, float], pd.DataFrame]:
    bundle = prepare_multimodal_bundle(
        data_file=data_file,
        lookback=lookback,
        feature_columns=feature_columns,
        group_columns=group_columns,
        max_samples=max_samples,
        random_state=random_state,
    )
    model = build_multimodal_baseline_model(bundle.sequence_shape, bundle.context_shape)
    train_multimodal_model(
        model,
        bundle.X_sequence_train,
        bundle.X_context_train,
        bundle.y_train,
        bundle.X_sequence_test,
        bundle.X_context_test,
        bundle.y_test,
        epochs=epochs,
        batch_size=batch_size,
    )
    predicted_scaled = model.predict([bundle.X_sequence_test, bundle.X_context_test], verbose=0).reshape(-1, 1)
    predicted_values = inverse_transform_values(predicted_scaled, bundle.sequence_scaler)
    metrics = regression_metrics(bundle.y_test_raw, predicted_values)
    predictions = save_prediction_frame(
        PROJECT_ROOT / "datasets" / "processed" / "multimodal_baseline_predictions.csv",
        bundle.test_meta,
        bundle.y_test_raw,
        predicted_values,
        "Multimodal LSTM",
    )
    return model, bundle, metrics, predictions


def run_multimodal_quantum_pipeline(
    data_file: Path | str = DEFAULT_DATA_FILE,
    lookback: int = DEFAULT_LOOKBACK,
    feature_columns: Sequence[str] | None = None,
    group_columns: Sequence[str] | None = None,
    max_samples: int | None = 2000,
    epochs: int = 8,
    batch_size: int = 16,
    random_state: int = 42,
) -> tuple[keras.Model, MultimodalBundle, dict[str, float], pd.DataFrame]:
    bundle = prepare_multimodal_bundle(
        data_file=data_file,
        lookback=lookback,
        feature_columns=feature_columns,
        group_columns=group_columns,
        max_samples=max_samples,
        random_state=random_state,
    )
    model = build_multimodal_quantum_model(bundle.sequence_shape, bundle.context_shape)
    train_multimodal_model(
        model,
        bundle.X_sequence_train,
        bundle.X_context_train,
        bundle.y_train,
        bundle.X_sequence_test,
        bundle.X_context_test,
        bundle.y_test,
        epochs=epochs,
        batch_size=batch_size,
    )
    predicted_scaled = model.predict([bundle.X_sequence_test, bundle.X_context_test], verbose=0).reshape(-1, 1)
    predicted_values = inverse_transform_values(predicted_scaled, bundle.sequence_scaler)
    metrics = regression_metrics(bundle.y_test_raw, predicted_values)
    predictions = save_prediction_frame(
        PROJECT_ROOT / "datasets" / "processed" / "multimodal_quantum_predictions.csv",
        bundle.test_meta,
        bundle.y_test_raw,
        predicted_values,
        "Multimodal Quantum LSTM",
    )
    return model, bundle, metrics, predictions


def comparison_table(*frames: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for frame in frames:
        model_name = str(frame["model"].iloc[0]) if "model" in frame.columns and len(frame) else "Model"
        rows.append(
            {
                "Model": model_name,
                **regression_metrics(frame["y_true"], frame["y_pred"]),
            }
        )
    return pd.DataFrame(rows)


def _stable_unit_value(text: str, seed: int) -> float:
    digest = hashlib.sha256(f"{seed}:{text}".encode("utf-8")).digest()
    integer_value = int.from_bytes(digest[:8], "big", signed=False)
    return integer_value / float(2**64 - 1)


def build_mock_multimodal_dataset(
    base_yield_file: Path | str = PROJECT_ROOT / "datasets" / "processed" / "faostat_yield_clean.csv",
    output_file: Path | str = DEFAULT_DATA_FILE,
    seed: int = 42,
) -> pd.DataFrame:
    yield_frame = load_clean_faostat_data(base_yield_file).copy()
    yield_frame = yield_frame.sort_values(["crop", "year"]).reset_index(drop=True)

    unique_crops = sorted(yield_frame["crop"].astype(str).unique())
    unique_years = yield_frame["year"].astype(int)
    min_year = int(unique_years.min())
    max_year = int(unique_years.max())
    year_span = max(max_year - min_year, 1)
    yield_min = float(yield_frame["yield_kg_per_ha"].min())
    yield_span = max(float(yield_frame["yield_kg_per_ha"].max()) - yield_min, 1.0)

    state_count = min(6, max(2, len(unique_crops) // 8))
    district_count = min(24, max(4, len(unique_crops) // 2))
    state_names = [f"MockState_{index + 1}" for index in range(state_count)]
    district_names = [f"MockDistrict_{index + 1}" for index in range(district_count)]
    crop_to_state = {
        crop_name: state_names[index % state_count]
        for index, crop_name in enumerate(unique_crops)
    }
    crop_to_district = {
        crop_name: district_names[(index * 3) % district_count]
        for index, crop_name in enumerate(unique_crops)
    }

    mock_rows: list[dict[str, object]] = []
    for row_index, row in yield_frame.iterrows():
        crop_name = str(row["crop"])
        year_value = int(row["year"])
        yield_value = float(row["yield_kg_per_ha"])
        state_name = crop_to_state[crop_name]
        district_name = crop_to_district[crop_name]

        yield_norm = (yield_value - yield_min) / yield_span
        year_norm = (year_value - min_year) / year_span
        crop_bias = _stable_unit_value(f"{crop_name}:crop", seed) - 0.5
        state_bias = _stable_unit_value(f"{state_name}:state", seed) - 0.5
        district_bias = _stable_unit_value(f"{district_name}:district", seed) - 0.5
        seasonal = np.sin((year_norm * np.pi * 2.0) + crop_bias * np.pi)

        row_noise = lambda label, scale=1.0: (_stable_unit_value(f"{row_index}:{label}", seed) - 0.5) * scale

        rainfall_mm = np.clip(
            700.0
            + 260.0 * yield_norm
            + 110.0 * seasonal
            + 90.0 * state_bias
            + 45.0 * district_bias
            + row_noise("rainfall", 55.0),
            120.0,
            2600.0,
        )
        temperature_c = np.clip(
            27.0
            - 5.0 * yield_norm
            - 1.5 * state_bias
            - 0.8 * district_bias
            + row_noise("temperature", 2.0),
            14.0,
            40.0,
        )
        humidity_pct = np.clip(
            58.0
            + 16.0 * yield_norm
            + 6.0 * state_bias
            - 2.0 * district_bias
            + row_noise("humidity", 6.0),
            20.0,
            98.0,
        )
        ndvi_mean = np.clip(
            0.28
            + 0.42 * yield_norm
            + 0.06 * seasonal
            + 0.04 * state_bias
            + row_noise("ndvi", 0.05),
            0.05,
            0.95,
        )
        soil_ph = np.clip(
            6.2
            + 0.4 * state_bias
            - 0.2 * district_bias
            + row_noise("soil_ph", 0.25),
            4.5,
            8.5,
        )
        soil_organic_carbon = np.clip(
            0.55
            + 0.22 * (1.0 - yield_norm)
            + 0.12 * state_bias
            + row_noise("soil_oc", 0.08),
            0.1,
            3.5,
        )
        irrigation_coverage = np.clip(
            0.18
            + 0.46 * yield_norm
            + 0.18 * year_norm
            + 0.09 * state_bias
            + row_noise("irrigation", 0.06),
            0.0,
            1.0,
        )
        fertilizer_kg_ha = np.clip(
            42.0
            + 125.0 * yield_norm
            + 32.0 * year_norm
            + 14.0 * state_bias
            + 9.0 * district_bias
            + row_noise("fertilizer", 18.0),
            0.0,
            420.0,
        )

        mock_rows.append(
            {
                "crop": crop_name,
                "state": state_name,
                "district": district_name,
                "year": year_value,
                "yield_kg_per_ha": yield_value,
                "rainfall_mm": float(rainfall_mm),
                "temperature_c": float(temperature_c),
                "humidity_pct": float(humidity_pct),
                "ndvi_mean": float(ndvi_mean),
                "soil_ph": float(soil_ph),
                "soil_organic_carbon": float(soil_organic_carbon),
                "irrigation_coverage": float(irrigation_coverage),
                "fertilizer_kg_ha": float(fertilizer_kg_ha),
            }
        )

    mock_frame = pd.DataFrame(mock_rows)
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    mock_frame.to_csv(output_path, index=False)
    return mock_frame
