# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.face_routes import router


app = FastAPI(
    title="Smart Classroom Face Recognition AI",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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