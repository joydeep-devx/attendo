"""Create numerical training inputs from clean historical timetable records.

Input: ``dataset/processed/historical_processed.json``.
Output: ``dataset/numpy/X.npy`` (features), ``y.npy`` (labels), and metadata.

Each actual historical placement is a positive example (label 1). A generated
unseen-day alternative for the same time, class type, and duration is a
negative example (label 0). The classifier can therefore score a possible
placement, but never finalizes the timetable; constraints still make that
decision.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DAY_ENCODINGS = {
    "Monday": 0,
    "Tuesday": 1,
    "Wednesday": 2,
    "Thursday": 3,
    "Friday": 4,
    "Saturday": 5,
}

FEATURE_NAMES = [
    "day_encoded",
    "start_hour",
    "duration_hours",
    "is_lab",
    "is_theory",
    "is_remedial",
]


def time_to_decimal_hour(time_value: str) -> float:
    """Convert a normalized ``HH:MM`` time into a numeric hour."""
    hours, minutes = time_value.split(":")
    return int(hours) + int(minutes) / 60


def record_to_features(record: dict[str, Any], start_time: str | None = None) -> list[float]:
    """Turn one historical placement or candidate placement into six values."""
    record_type = record["record_type"]
    if record["day"] not in DAY_ENCODINGS:
        raise ValueError(f"Unsupported day: {record['day']!r}")
    if record_type not in {"theory", "lab", "remedial"}:
        raise ValueError(f"Unsupported record type: {record_type!r}")

    return [
        float(DAY_ENCODINGS[record["day"]]),
        time_to_decimal_hour(start_time or record["start_time"]),
        float(record["duration_hours"]),
        float(record_type == "lab"),
        float(record_type == "theory"),
        float(record_type == "remedial"),
    ]


def build_training_arrays(records: list[dict[str, Any]]) -> tuple[np.ndarray, np.ndarray]:
    """Build positive historical rows and one unseen-day alternative per row."""
    observed_signatures = {
        (record["day"], record["start_time"], record["duration_hours"], record["record_type"])
        for record in records
    }
    rows: list[list[float]] = []
    labels: list[int] = []

    for record in records:
        rows.append(record_to_features(record))
        labels.append(1)

        for alternative_day in DAY_ENCODINGS:
            signature = (
                alternative_day,
                record["start_time"],
                record["duration_hours"],
                record["record_type"],
            )
            if signature in observed_signatures:
                continue
            alternative_record = {**record, "day": alternative_day}
            rows.append(record_to_features(alternative_record))
            labels.append(0)
            break

    if not rows:
        raise ValueError("No historical records are available for NumPy training data.")
    return np.asarray(rows, dtype=np.float64), np.asarray(labels, dtype=np.int8)


def create_numpy_training_data(
    historical_path: str | Path = PROJECT_ROOT / "dataset/processed/historical_processed.json",
    output_dir: str | Path = PROJECT_ROOT / "dataset/numpy",
) -> tuple[np.ndarray, np.ndarray]:
    """Load processed history and save the feature matrix, labels, and metadata."""
    with Path(historical_path).open("r", encoding="utf-8") as file:
        payload = json.load(file)

    X, y = build_training_arrays(payload.get("records", []))
    destination = Path(output_dir)
    destination.mkdir(parents=True, exist_ok=True)
    np.save(destination / "X.npy", X)
    np.save(destination / "y.npy", y)

    metadata = {
        "purpose": "Binary training data for ranking timetable placement candidates.",
        "feature_names": FEATURE_NAMES,
        "label_name": "historical_placement_selected",
        "label_encoding": {"0": "unseen-day alternative candidate", "1": "historical placement"},
        "shape": {"rows": int(X.shape[0]), "columns": int(X.shape[1])},
        "source": str(historical_path),
        "warning": "Current sample history contains only Thursday records; add full multi-day history before relying on model predictions.",
    }
    with (destination / "feature_metadata.json").open("w", encoding="utf-8") as file:
        json.dump(metadata, file, indent=2, ensure_ascii=False)
        file.write("\n")
    return X, y


if __name__ == "__main__":
    matrix, labels = create_numpy_training_data()
    print(f"Created X.npy with shape {matrix.shape} and y.npy with shape {labels.shape}.")
