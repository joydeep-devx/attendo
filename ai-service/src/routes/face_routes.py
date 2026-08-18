# pyrefly: ignore [missing-import]
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from src.utils.image_utils import bytes_to_rgb_image
from src.face.recognizer import get_face_embeddings
from src.face.matcher import match_embedding, DEFAULT_THRESHOLD


router = APIRouter(
    prefix="/face",
    tags=["Face Recognition"]
)


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

@router.post("/embeddings/batch")
async def create_embeddings_batch(
    images: List[UploadFile] = File(
        ...,
        description="Several image files, e.g. 5 snapshots captured client-side."
    )
):
    results = []

    for index, image in enumerate(images):
        try:
            image_bytes = await image.read()
            rgb_image = bytes_to_rgb_image(image_bytes)
        except ValueError as val_err:
            results.append({"index": index, "filename": image.filename,
                             "success": False, "face_detected": False,
                             "face_count": 0, "faces": [], "message": str(val_err)})
            continue
        except Exception:
            results.append({"index": index, "filename": image.filename,
                             "success": False, "face_detected": False,
                             "face_count": 0, "faces": [],
                             "message": "Failed to read or decode uploaded image file."})
            continue

        try:
            embedding_result = get_face_embeddings(rgb_image)
        except Exception as exc:
            results.append({"index": index, "filename": image.filename,
                             "success": False, "face_detected": False,
                             "face_count": 0, "faces": [],
                             "message": f"Face recognition error: {str(exc)}"})
            continue

        results.append({"index": index, "filename": image.filename, **embedding_result})

    return {"count": len(images), "results": results}

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
