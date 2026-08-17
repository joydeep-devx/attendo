"""Train the timetable-candidate scoring model from NumPy feature arrays."""

from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


PROJECT_ROOT = Path(__file__).resolve().parents[1]
NUMPY_DIR = PROJECT_ROOT / "dataset/numpy"
MODEL_PATH = PROJECT_ROOT / "ml/model.joblib"


def train() -> RandomForestClassifier:
    """Fit a binary candidate scorer and persist it for the prediction stage."""
    X = np.load(NUMPY_DIR / "X.npy")
    y = np.load(NUMPY_DIR / "y.npy")

    if X.ndim != 2 or len(X) != len(y):
        raise ValueError("X.npy and y.npy must contain matching two-dimensional features and labels.")
    if len(np.unique(y)) < 2:
        raise ValueError("Training needs both selected (1) and alternative (0) candidate labels.")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    model = RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced",
        random_state=42,
    )
    model.fit(X_train, y_train)
    accuracy = model.score(X_test, y_test)

    joblib.dump(model, MODEL_PATH)
    print(f"Saved {MODEL_PATH}.")
    print(f"Validation accuracy: {accuracy:.3f}")
    print("This score ranks candidates only; constraints and final validation still decide the timetable.")
    return model


if __name__ == "__main__":
    train()
