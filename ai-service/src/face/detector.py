import face_recognition


def detect_faces(image):
    """
    Detect faces from an RGB image.

    Returns:
        List of face locations.
    """

    return face_recognition.face_locations(image)