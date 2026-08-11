from __future__ import annotations

import logging
import os
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MPL_CACHE_DIR = PROJECT_ROOT / ".mpl-cache"
MPL_CACHE_DIR.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("MPLCONFIGDIR", str(MPL_CACHE_DIR))
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import numpy as np
import pandas as pd
import pennylane as qml
import tensorflow as tf
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from tensorflow import keras
from tensorflow.keras import layers

tf.get_logger().setLevel(logging.ERROR)
warnings.filterwarnings(
    "ignore",
    message="Support for the TensorFlow interface is deprecated.*",
)
warnings.filterwarnings(
    "ignore",
    message="AutoGraph could not transform.*",
)

DEFAULT_DATA_FILE = PROJECT_ROOT / "datasets" / "processed" / "faostat_yield_clean.csv"
DEFAULT_LOOKBACK = 5


@dataclass
class SequenceBundle:
    X_train: np.ndarray
    X_test: np.ndarray
    y_train: np.ndarray
    y_test: np.ndarray
    y_train_raw: np.ndarray
    y_test_raw: np.ndarray
    scaler: MinMaxScaler
    train_meta: pd.DataFrame
    test_meta: pd.DataFrame


def load_clean_faostat_data(data_file: Path | str = DEFAULT_DATA_FILE) -> pd.DataFrame:
    data_path = Path(data_file)
    if not data_path.exists():
        raise FileNotFoundError(f"Missing cleaned FAOSTAT file: {data_path}")

    frame = pd.read_csv(data_path)
    required_columns = {"crop", "year", "yield_kg_per_ha"}
    missing_columns = required_columns - set(frame.columns)
    if missing_columns:
        raise ValueError(f"Missing required columns: {sorted(missing_columns)}")

    cleaned = frame.copy()
    cleaned["crop"] = cleaned["crop"].astype(str).str.strip()
    cleaned["year"] = pd.to_numeric(cleaned["year"], errors="coerce")
    cleaned["yield_kg_per_ha"] = pd.to_numeric(cleaned["yield_kg_per_ha"], errors="coerce")
    cleaned = cleaned.dropna(subset=["crop", "year", "yield_kg_per_ha"])
    cleaned = cleaned.sort_values(["crop", "year"]).reset_index(drop=True)
    return cleaned


def build_sequence_samples(
    frame: pd.DataFrame,
    lookback: int = DEFAULT_LOOKBACK,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    feature_windows: list[np.ndarray] = []
    target_values: list[float] = []
    crop_labels: list[str] = []
    target_years: list[int] = []

    for crop_name, crop_frame in frame.groupby("crop"):
        ordered = crop_frame.sort_values("year")
        values = ordered["yield_kg_per_ha"].to_numpy(dtype=np.float32)
        years = ordered["year"].to_numpy(dtype=np.int32)

        if len(values) <= lookback:
            continue

        for index in range(len(values) - lookback):
            feature_windows.append(values[index : index + lookback].reshape(lookback, 1))
            target_values.append(float(values[index + lookback]))
            crop_labels.append(str(crop_name))
            target_years.append(int(years[index + lookback]))

    return (
        np.asarray(feature_windows, dtype=np.float32),
        np.asarray(target_values, dtype=np.float32),
        np.asarray(crop_labels, dtype=object),
        np.asarray(target_years, dtype=np.int32),
    )


def prepare_sequence_bundle(
    data_file: Path | str = DEFAULT_DATA_FILE,
    lookback: int = DEFAULT_LOOKBACK,
    test_size: float = 0.2,
    random_state: int = 42,
    max_samples: int | None = 1200,
) -> SequenceBundle:
    frame = load_clean_faostat_data(data_file)
    X_raw, y_raw, crops, target_years = build_sequence_samples(frame, lookback=lookback)

    if max_samples is not None and len(X_raw) > max_samples:
        rng = np.random.default_rng(random_state)
        indices = rng.choice(len(X_raw), size=max_samples, replace=False)
        X_raw = X_raw[indices]
        y_raw = y_raw[indices]
        crops = crops[indices]
        target_years = target_years[indices]

    metadata = pd.DataFrame({"crop": crops, "target_year": target_years})
    X_train_raw, X_test_raw, y_train_raw, y_test_raw, train_meta, test_meta = train_test_split(
        X_raw,
        y_raw,
        metadata,
        test_size=test_size,
        random_state=random_state,
        shuffle=True,
    )

    scaler = MinMaxScaler()
    training_values = np.concatenate(
        [X_train_raw.reshape(-1, 1), y_train_raw.reshape(-1, 1)],
        axis=0,
    )
    scaler.fit(training_values)

    X_train = scaler.transform(X_train_raw.reshape(-1, 1)).reshape(X_train_raw.shape)
    X_test = scaler.transform(X_test_raw.reshape(-1, 1)).reshape(X_test_raw.shape)
    y_train = scaler.transform(y_train_raw.reshape(-1, 1)).reshape(-1)
    y_test = scaler.transform(y_test_raw.reshape(-1, 1)).reshape(-1)

    return SequenceBundle(
        X_train=X_train.astype(np.float32),
        X_test=X_test.astype(np.float32),
        y_train=y_train.astype(np.float32),
        y_test=y_test.astype(np.float32),
        y_train_raw=y_train_raw.astype(np.float32),
        y_test_raw=y_test_raw.astype(np.float32),
        scaler=scaler,
        train_meta=train_meta.reset_index(drop=True),
        test_meta=test_meta.reset_index(drop=True),
    )


def build_baseline_model(input_shape: tuple[int, ...]) -> keras.Model:
    keras.backend.clear_session()
    model = keras.Sequential(
        [
            layers.Input(shape=input_shape),
            layers.LSTM(32, return_sequences=True),
            layers.Dropout(0.2),
            layers.LSTM(16),
            layers.Dense(16, activation="relu"),
            layers.Dense(1),
        ]
    )
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=1e-3), loss="mse", metrics=["mae"])
    return model


class QuantumLayer(layers.Layer):
    def __init__(self, n_qubits: int = 4, n_layers: int = 2, **kwargs):
        super().__init__(**kwargs)
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.device = qml.device("default.qubit", wires=n_qubits)

        @qml.qnode(self.device, interface="tf")
        def circuit(inputs, q_weights):
            qml.AngleEmbedding(inputs, wires=range(self.n_qubits))
            qml.BasicEntanglerLayers(q_weights, wires=range(self.n_qubits))
            return [qml.expval(qml.PauliZ(index)) for index in range(self.n_qubits)]

        self.circuit = circuit

    def build(self, input_shape):
        self.q_weights = self.add_weight(
            name="q_weights",
            shape=(self.n_layers, self.n_qubits),
            initializer="random_normal",
            trainable=True,
            dtype=tf.float32,
        )

    def call(self, inputs):
        q_weights = tf.convert_to_tensor(self.q_weights)

        @tf.autograph.experimental.do_not_convert
        def evaluate(sample):
            sample = tf.cast(sample, tf.float32)
            outputs = self.circuit(sample, q_weights)
            outputs = tf.stack(outputs) if isinstance(outputs, (list, tuple)) else outputs
            return tf.cast(outputs, tf.float32)

        return tf.map_fn(
            evaluate,
            inputs,
            fn_output_signature=tf.TensorSpec(shape=(self.n_qubits,), dtype=tf.float32),
        )

    def compute_output_shape(self, input_shape):
        return (input_shape[0], self.n_qubits)


def build_quantum_model(input_shape: tuple[int, ...], n_qubits: int = 4, n_layers: int = 2) -> keras.Model:
    keras.backend.clear_session()
    inputs = keras.Input(shape=input_shape)
    x = layers.LSTM(24, return_sequences=True)(inputs)
    x = layers.Dropout(0.2)(x)
    x = layers.LSTM(12)(x)
    x = layers.Dense(n_qubits, activation="relu")(x)
    x = QuantumLayer(n_qubits=n_qubits, n_layers=n_layers)(x)
    outputs = layers.Dense(1)(x)
    model = keras.Model(inputs, outputs, name="quantum_lstm")
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=1e-3), loss="mse", metrics=["mae"])
    return model


def train_model(
    model: keras.Model,
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_valid: np.ndarray,
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
        X_train,
        y_train,
        validation_data=(X_valid, y_valid),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1,
        callbacks=callbacks,
    )


def inverse_transform_values(values: Iterable[float] | np.ndarray, scaler: MinMaxScaler) -> np.ndarray:
    array = np.asarray(values, dtype=np.float32).reshape(-1, 1)
    return scaler.inverse_transform(array).reshape(-1)


def regression_metrics(y_true: Iterable[float], y_pred: Iterable[float]) -> dict[str, float]:
    y_true_array = np.asarray(y_true, dtype=np.float32)
    y_pred_array = np.asarray(y_pred, dtype=np.float32)
    return {
        "MAE": float(mean_absolute_error(y_true_array, y_pred_array)),
        "RMSE": float(np.sqrt(mean_squared_error(y_true_array, y_pred_array))),
        "R2": float(r2_score(y_true_array, y_pred_array)),
    }


def save_prediction_frame(
    output_file: Path | str,
    meta: pd.DataFrame,
    y_true: Iterable[float],
    y_pred: Iterable[float],
    model_name: str,
) -> pd.DataFrame:
    result = meta.copy().reset_index(drop=True)
    result["model"] = model_name
    result["y_true"] = np.asarray(y_true, dtype=np.float32)
    result["y_pred"] = np.asarray(y_pred, dtype=np.float32)
    result["residual"] = result["y_true"] - result["y_pred"]
    result["abs_error"] = result["residual"].abs()

    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.to_csv(output_path, index=False)
    return result


def run_baseline_pipeline(
    data_file: Path | str = DEFAULT_DATA_FILE,
    lookback: int = DEFAULT_LOOKBACK,
    max_samples: int | None = 1200,
    epochs: int = 8,
    batch_size: int = 32,
    random_state: int = 42,
) -> tuple[keras.Model, SequenceBundle, dict[str, float], pd.DataFrame]:
    bundle = prepare_sequence_bundle(
        data_file=data_file,
        lookback=lookback,
        max_samples=max_samples,
        random_state=random_state,
    )
    model = build_baseline_model(bundle.X_train.shape[1:])
    train_model(
        model,
        bundle.X_train,
        bundle.y_train,
        bundle.X_test,
        bundle.y_test,
        epochs=epochs,
        batch_size=batch_size,
    )
    predicted_scaled = model.predict(bundle.X_test, verbose=0).reshape(-1, 1)
    predicted_values = inverse_transform_values(predicted_scaled, bundle.scaler)
    y_true_values = bundle.y_test_raw
    metrics = regression_metrics(y_true_values, predicted_values)
    frame = save_prediction_frame(
        PROJECT_ROOT / "datasets" / "processed" / "baseline_predictions.csv",
        bundle.test_meta,
        y_true_values,
        predicted_values,
        "LSTM",
    )
    return model, bundle, metrics, frame


def run_quantum_pipeline(
    data_file: Path | str = DEFAULT_DATA_FILE,
    lookback: int = DEFAULT_LOOKBACK,
    max_samples: int | None = 1200,
    epochs: int = 5,
    batch_size: int = 16,
    random_state: int = 42,
) -> tuple[keras.Model, SequenceBundle, dict[str, float], pd.DataFrame]:
    bundle = prepare_sequence_bundle(
        data_file=data_file,
        lookback=lookback,
        max_samples=max_samples,
        random_state=random_state,
    )
    model = build_quantum_model(bundle.X_train.shape[1:])
    train_model(
        model,
        bundle.X_train,
        bundle.y_train,
        bundle.X_test,
        bundle.y_test,
        epochs=epochs,
        batch_size=batch_size,
    )
    predicted_scaled = model.predict(bundle.X_test, verbose=0).reshape(-1, 1)
    predicted_values = inverse_transform_values(predicted_scaled, bundle.scaler)
    y_true_values = bundle.y_test_raw
    metrics = regression_metrics(y_true_values, predicted_values)
    frame = save_prediction_frame(
        PROJECT_ROOT / "datasets" / "processed" / "quantum_predictions.csv",
        bundle.test_meta,
        y_true_values,
        predicted_values,
        "Quantum LSTM",
    )
    return model, bundle, metrics, frame


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
