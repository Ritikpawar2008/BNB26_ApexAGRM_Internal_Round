from fastapi import APIRouter
from app.services.video.ffmpeg_service import get_ffmpeg_binary

router = APIRouter()

@router.get("/health")
def health_check():
    try:
        bin_path = get_ffmpeg_binary()
        ffmpeg_available = bool(bin_path)
    except Exception:
        ffmpeg_available = False

    return {
        "status": "healthy",
        "ffmpeg": ffmpeg_available,
        "database": True
    }

