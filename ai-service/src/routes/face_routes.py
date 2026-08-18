# pyrefly: ignore [missing-import]
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np

from src.utils.image_utils import bytes_to_rgb_image
from src.face.recognizer import get_face_embeddings
from src.face.matcher import match_embedding, DEFAULT_THRESHOLD


router = APIRouter(
    prefix="/face",
    tags=["Face Recognition"]
)


def _build_database_ready_embedding(embeddings: List[List[float]]) -> dict:
    """
    Build a stable embedding from multiple snapshots.
    """

    emb_np = np.array(embeddings, dtype=np.float64)
    centroid = emb_np.mean(axis=0)
    distances = np.linalg.norm(emb_np - centroid, axis=1)

    keep_count = max(1, min(3, len(embeddings)))
    keep_indices = np.argsort(distances)[:keep_count]
    kept = emb_np[keep_indices]
    final_embedding = kept.mean(axis=0)

    return {
        "embedding": final_embedding.tolist(),
        "dimensions": int(final_embedding.shape[0]),
        "aggregation": {
            "method": "mean_of_closest_to_centroid",
            "input_count": len(embeddings),
            "kept_count": int(keep_count),
            "kept_indices": [int(i) for i in keep_indices.tolist()],
            "distances_to_centroid": [round(float(d), 6) for d in distances.tolist()],
        }
    }


# ----------------------------------------------------------------
# Request model for /face/match
# ----------------------------------------------------------------

class MatchRequest(BaseModel):
    """Request body for the /face/match endpoint."""

    current_embedding: List[float] = Field(
        ...,
        description="128-dimensional embedding of the face to identify."
    )
    stored_embeddings: List[List[float]] = Field(
        ...,
        description="List of known 128-dimensional embeddings to compare against."
    )
    threshold: float = Field(
        DEFAULT_THRESHOLD,
        description=(
            "Maximum face distance to consider a match. "
            "Default is 0.5. Tune with real data."
        )
    )


# ----------------------------------------------------------------
# 1. POST /face/embedding
# ----------------------------------------------------------------

@router.post("/embedding")
async def create_embedding(
    image: UploadFile = File(
        ...,
        description="Image file (JPEG, PNG, etc.) containing a face."
    )
):
    """
    Accept an image upload, detect all faces, and return their
    128-dimensional embeddings.

    Returns all detected faces — never silently picks one when multiple
    faces are present.
    """

    try:
        image_bytes = await image.read()
        rgb_image = bytes_to_rgb_image(image_bytes)
    except ValueError as val_err:
        raise HTTPException(
            status_code=400,
            detail=str(val_err)
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Failed to read or decode uploaded image file."
        )

    try:
        result = get_face_embeddings(rgb_image)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Face recognition error: {str(exc)}"
        )

    return result


@router.post("/embedding/enroll")
async def create_enrollment_embedding(
    student_id: Optional[str] = Form(
        None,
        description="Optional student identifier from frontend."
    ),
    images: List[UploadFile] = File(
        ...,
        description="Exactly 5 face images of the same person."
    )
):
    """
    Accept 5 images and return one DB-ready embedding.
    """

    if len(images) != 5:
        raise HTTPException(
            status_code=422,
            detail="Exactly 5 images are required for enrollment."
        )

    valid_embeddings: List[List[float]] = []
    sample_results = []

    for index, image in enumerate(images):
        try:
            image_bytes = await image.read()
            rgb_image = bytes_to_rgb_image(image_bytes)
        except ValueError as val_err:
            sample_results.append({
                "index": index,
                "filename": image.filename,
                "accepted": False,
                "message": str(val_err)
            })
            continue
        except Exception:
            sample_results.append({
                "index": index,
                "filename": image.filename,
                "accepted": False,
                "message": "Failed to read or decode uploaded image file."
            })
            continue

        try:
            result = get_face_embeddings(rgb_image)
        except Exception as exc:
            sample_results.append({
                "index": index,
                "filename": image.filename,
                "accepted": False,
                "message": f"Face recognition error: {str(exc)}"
            })
            continue

        if not result.get("success"):
            sample_results.append({
                "index": index,
                "filename": image.filename,
                "accepted": False,
                "message": result.get("message", "No face detected")
            })
            continue

        face_count = int(result.get("face_count", 0))
        if face_count != 1:
            sample_results.append({
                "index": index,
                "filename": image.filename,
                "accepted": False,
                "message": f"Expected exactly 1 face, got {face_count}."
            })
            continue

        valid_embeddings.append(result["faces"][0]["embedding"])
        sample_results.append({
            "index": index,
            "filename": image.filename,
            "accepted": True,
            "message": "Accepted"
        })

    if len(valid_embeddings) < 3:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "At least 3 valid single-face images are required to build a reliable enrollment embedding.",
                "valid_count": len(valid_embeddings),
                "required_minimum": 3,
                "samples": sample_results
            }
        )

    aggregate = _build_database_ready_embedding(valid_embeddings)

    return {
        "success": True,
        "student_id": student_id,
        "valid_samples": len(valid_embeddings),
        "requested_samples": len(images),
        "samples": sample_results,
        "database_record": {
            "student_id": student_id,
            "embedding": aggregate["embedding"],
            "dimensions": aggregate["dimensions"],
            "metadata": aggregate["aggregation"],
        }
    }


@router.post("/embedding/enroll-five-fields")
async def create_enrollment_embedding_five_fields(
    student_id: Optional[str] = Form(
        None,
        description="Optional student identifier from frontend."
    ),
    image1: UploadFile = File(..., description="Face image 1"),
    image2: UploadFile = File(..., description="Face image 2"),
    image3: UploadFile = File(..., description="Face image 3"),
    image4: UploadFile = File(..., description="Face image 4"),
    image5: UploadFile = File(..., description="Face image 5")
):
    """
    Enrollment endpoint with 5 explicit file fields for easy Swagger upload.
    """

    return await create_enrollment_embedding(
        student_id=student_id,
        images=[image1, image2, image3, image4, image5]
    )



# ----------------------------------------------------------------
# 2. POST /face/match
# ----------------------------------------------------------------

@router.post("/match")
async def match_face(data: MatchRequest):
    """
    Compare a current 128-D embedding against a list of stored embeddings.

    Returns the minimum face distance found and whether it is below
    the configured threshold.

    Note: face_recognition returns a *distance* — lower distance means
    more similar faces. Do not confuse distance with confidence.
    """

    if len(data.stored_embeddings) == 0:
        return {
            "success": False,
            "message": "stored_embeddings list must not be empty."
        }

    try:
        result = match_embedding(
            data.current_embedding,
            data.stored_embeddings,
            data.threshold
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Matching error: {str(exc)}"
        )

    # Surface validation errors from matcher as 422-equivalent responses.
    if "error" in result:
        return {
            "success": False,
            "message": result["error"]
        }

    return {
        "success": True,
        **result
    }
