# pyrefly: ignore [missing-import]
from fastapi import FastAPI

from src.routes.face_routes import router


app = FastAPI(
    title="Smart Classroom Face Recognition AI",
    version="1.0.0"
)


app.include_router(router)


@app.get("/")
def root():

    return {
        "service": "Face Recognition AI",
        "status": "running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }