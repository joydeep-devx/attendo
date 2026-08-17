from src.face.detector import detect_faces
from src.face.embedder import generate_embeddings


def get_face_embeddings(image) -> dict:
    """
    Orchestrate face detection and embedding generation.

    Args:
        image: RGB NumPy image array.

    Returns:
        JSON-compatible dictionary with face locations and 128-D embeddings.
        Returns all detected faces (never silently picks one).
    """

    face_locations = detect_faces(image)

    if not face_locations:
        return {
            "success": False,
            "face_detected": False,
            "face_count": 0,
            "faces": [],
            "message": "No face detected"
        }

    # generate_embeddings() already returns plain Python lists.
    embeddings = generate_embeddings(image, face_locations)

    faces = []

    for location, embedding in zip(face_locations, embeddings):

        faces.append({
            "location": {
                "top": location[0],
                "right": location[1],
                "bottom": location[2],
                "left": location[3]
            },
            "embedding": embedding,          # already a list
            "dimensions": len(embedding)
        })

    return {
        "success": True,
        "face_detected": True,
        "face_count": len(faces),
        "faces": faces
    }