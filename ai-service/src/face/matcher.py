import face_recognition
import numpy as np
from typing import List


DEFAULT_THRESHOLD = 0.50
EMBEDDING_DIMENSIONS = 128


def match_embedding(
    current_embedding: List[float],
    stored_embeddings: List[List[float]],
    threshold: float = DEFAULT_THRESHOLD
) -> dict:
    """
    Compare one current embedding against multiple stored embeddings.

    Uses face_recognition.face_distance() — lower distance means more similar.
    Finds the minimum distance across all stored embeddings and compares it
    against the threshold.

    Args:
        current_embedding: A list of 128 floats representing the query face.
        stored_embeddings: A list of known embeddings (each must be 128 floats).
        threshold: Maximum distance to consider a match (default 0.5).
                   This value is configurable — tune it using real data.

    Returns:
        JSON-compatible dict with keys: matched, distance, threshold.
        On validation error: returns dict with error key.
    """

    # --- Validate current embedding ---
    if len(current_embedding) != EMBEDDING_DIMENSIONS:
        return {
            "matched": False,
            "distance": None,
            "threshold": threshold,
            "error": (
                f"current_embedding must have {EMBEDDING_DIMENSIONS} dimensions, "
                f"got {len(current_embedding)}"
            )
        }

    # --- Validate stored embeddings ---
    if not stored_embeddings:
        return {
            "matched": False,
            "distance": None,
            "threshold": threshold,
            "error": "stored_embeddings list is empty"
        }

    for idx, stored in enumerate(stored_embeddings):
        if len(stored) != EMBEDDING_DIMENSIONS:
            return {
                "matched": False,
                "distance": None,
                "threshold": threshold,
                "error": (
                    f"stored_embeddings[{idx}] must have {EMBEDDING_DIMENSIONS} "
                    f"dimensions, got {len(stored)}"
                )
            }

    # --- Convert to NumPy for face_recognition ---
    current_np = np.array(current_embedding)
    stored_np_list = [np.array(e) for e in stored_embeddings]

    # --- Find the minimum distance across all stored embeddings ---
    best_distance = float("inf")

    for stored_np in stored_np_list:

        distance = face_recognition.face_distance(
            [stored_np],
            current_np
        )[0]

        if distance < best_distance:
            best_distance = distance

    matched = best_distance <= threshold

    return {
        "matched": bool(matched),
        "distance": round(float(best_distance), 4),
        "threshold": threshold
    }