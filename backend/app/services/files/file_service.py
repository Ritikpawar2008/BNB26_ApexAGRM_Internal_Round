import os
import shutil
from fastapi import UploadFile
from app.core.config import settings
from app.services.video.ffmpeg_service import VideoProcessingService

class FileService:
    @staticmethod
    def save_upload(file: UploadFile, project_id: str) -> dict:
        uploads_dir = os.path.join(settings.STORAGE_DIR, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Save file with project_id prefix to prevent collisions
        safe_filename = f"{project_id}_source.mp4"
        dest_path = os.path.join(uploads_dir, safe_filename)
        
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(dest_path)
        duration = VideoProcessingService.get_duration(dest_path)
        relative_path = f"storage/uploads/{safe_filename}"
        
        return {
            "filename": file.filename or safe_filename,
            "storage_path": relative_path,
            "mime_type": file.content_type or "video/mp4",
            "file_size": file_size,
            "duration": duration,
            "absolute_path": dest_path
        }

