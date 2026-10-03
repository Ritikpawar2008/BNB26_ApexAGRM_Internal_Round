from fastapi import APIRouter
import shutil

router = APIRouter()

@router.get("/health")
def health_check():
    ffmpeg_available = shutil.which("ffmpeg") is not None
    return {
        "status": "healthy",
        "ffmpeg": ffmpeg_available,
        "database": True
    }
