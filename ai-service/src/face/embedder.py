import face_recognition
from typing import List


def generate_embeddings(image, face_locations: list) -> List[list]:
    """
    Generate 128-dimensional face embeddings for each detected face location.

    Args:
        image: RGB NumPy image array.
        face_locations: List of face location tuples from detect_faces().

    Returns:
        List of embeddings. Each embedding is a plain Python list of
        128 floating-point numbers (JSON-serializable).
    """

    raw_encodings = face_recognition.face_encodings(image, face_locations)

    # Convert each NumPy array to a plain Python list for JSON compatibility.
    return [encoding.tolist() for encoding in raw_encodings]