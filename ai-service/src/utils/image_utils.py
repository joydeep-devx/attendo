import cv2
import numpy as np


def bytes_to_rgb_image(image_bytes: bytes):
    """
    Convert raw image bytes (from an uploaded file) into an RGB NumPy array.

    Flow:
        uploaded file bytes
        → NumPy uint8 buffer
        → OpenCV decode (BGR)
        → convert to RGB

    Args:
        image_bytes: Raw bytes of the uploaded image file.

    Returns:
        RGB NumPy ndarray suitable for face_recognition functions.

    Raises:
        ValueError: If image_bytes is empty or cannot be decoded as a valid image.
    """

    if not image_bytes:
        raise ValueError("No image data received.")

    array = np.frombuffer(image_bytes, dtype=np.uint8)

    image = cv2.imdecode(array, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Invalid image: Could not decode image bytes.")

    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
