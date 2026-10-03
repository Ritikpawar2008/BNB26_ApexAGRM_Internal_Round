import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.schemas.common import SuccessResponse
from app.schemas.project import (
    ProjectCreateRequest,
    ProjectResponse,
    UploadAssetResponse,
    ProjectDetailResponse,
    AssetDetailResponse,
    AnalyzeProjectResponse,
    ExportRequest,
    ExportResponse
)
from app.schemas.clip import ClipsUpdateRequest, ClipsUpdateData, ClipResponse
from app.schemas.activity import ActivityListResponse
from app.services.projects.project_service import ProjectService
from app.services.files.file_service import FileService
from app.services.ai.gemini_service import GeminiAIService
from app.services.video.ffmpeg_service import VideoProcessingService
from app.services.activity.activity_service import ActivityService

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("", response_model=SuccessResponse[ProjectResponse], status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreateRequest, db: Session = Depends(get_db)):
    project = ProjectService.create_project(db, payload.name)
    return SuccessResponse(data=ProjectResponse.model_validate(project))

@router.get("", response_model=SuccessResponse[List[ProjectResponse]])
def get_projects(db: Session = Depends(get_db)):
    projects = ProjectService.get_all_projects(db)
    return SuccessResponse(data=[ProjectResponse.model_validate(p) for p in projects])

@router.post("/{project_id}/upload", response_model=SuccessResponse[UploadAssetResponse])
def upload_video(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    project = ProjectService.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="PROJECT_NOT_FOUND: Project not found")

    file_info = FileService.save_upload(file, project_id)
    asset = ProjectService.create_asset(db, project_id, file_info)

    ActivityService.record(
        db,
        project_id=project_id,
        type="video_uploaded",
        status="completed",
        title="Video uploaded",
        description=f"{asset.filename} uploaded successfully",
        metadata={"file_size": asset.file_size, "duration": asset.duration}
    )
    
    return SuccessResponse(data=UploadAssetResponse(
        asset_id=asset.id,
        project_id=project_id,
        filename=asset.filename,
        file_size=asset.file_size,
        mime_type=asset.mime_type,
        duration=asset.duration,
        status="uploaded"
    ))

@router.get("/{project_id}", response_model=SuccessResponse[ProjectDetailResponse])
def get_project_detail(project_id: str, db: Session = Depends(get_db)):
    project = ProjectService.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="PROJECT_NOT_FOUND: Project not found")

    asset = ProjectService.get_asset_for_project(db, project_id)
    asset_detail = None
    if asset:
        url_path = f"/{asset.storage_path}" if not asset.storage_path.startswith("/") else asset.storage_path
        asset_detail = AssetDetailResponse(
            id=asset.id,
            filename=asset.filename,
            url=url_path,
            duration=asset.duration
        )

    clips = ProjectService.get_clips_for_project(db, project_id)
    clips_detail = []
    for c in clips:
        clips_detail.append(ClipResponse(
            id=c.id,
            position=c.position,
            start_time=c.start_time,
            end_time=c.end_time,
            title=c.title,
            reason=c.reason,
            hook=c.hook,
            caption=c.caption,
            confidence=c.confidence,
            url=c.clip_path,
            is_selected=c.is_selected
        ))

    return SuccessResponse(data=ProjectDetailResponse(
        id=project.id,
        name=project.name,
        status=project.status,
        asset=asset_detail,
        clips=clips_detail
    ))

@router.get("/{project_id}/activity", response_model=SuccessResponse[ActivityListResponse])
def get_project_activity(project_id: str, db: Session = Depends(get_db)):
    project = ProjectService.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="PROJECT_NOT_FOUND: Project not found")

    activities = ActivityService.get_activities(db, project_id)
    items = [ActivityService.to_item(a) for a in activities]
    return SuccessResponse(data=ActivityListResponse(activities=items))

@router.post("/{project_id}/analyze", response_model=SuccessResponse[AnalyzeProjectResponse])
def analyze_project(project_id: str, db: Session = Depends(get_db)):
    project = ProjectService.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="PROJECT_NOT_FOUND: Project not found")

    asset = ProjectService.get_asset_for_project(db, project_id)
    source_path = os.path.join(settings.STORAGE_DIR, "uploads", f"{project_id}_source.mp4")
    if not os.path.exists(source_path) and asset:
        source_path = os.path.abspath(asset.storage_path)

    ActivityService.record(
        db,
        project_id=project_id,
        type="analysis_started",
        status="in_progress",
        title="Video analysis started",
        description="Analyzing video semantics and pacing..."
    )

    # Call Gemini AIService
    ai_result = GeminiAIService.analyze_video(source_path)

    if getattr(ai_result, "is_fallback", False):
        ActivityService.record(
            db,
            project_id=project_id,
            type="gemini_failed",
            status="warning",
            title="Gemini processing failed",
            description="Fallback processing activated"
        )
        ActivityService.record(
            db,
            project_id=project_id,
            type="fallback_activated",
            status="completed",
            title="Fallback processing completed",
            description="Video clips generated using fallback instructions"
        )

    # Persist in DB
    analysis, clips = ProjectService.save_analysis_and_clips(db, project_id, ai_result.summary, ai_result.clips)

    # Extract clips via VideoProcessingService
    clips_dir = os.path.join(settings.STORAGE_DIR, "clips")
    os.makedirs(clips_dir, exist_ok=True)
    for c in clips:
        clip_output_path = os.path.join(clips_dir, f"{project_id}_{c.id}.mp4")
        VideoProcessingService.extract_clip(source_path, c.start_time, c.end_time, clip_output_path)


    ActivityService.record(
        db,
        project_id=project_id,
        type="analysis_completed",
        status="completed",
        title="Video analysis completed",
        description=f"AI identified {len(clips)} viral moments",
        metadata={"clips_detected": len(clips)}
    )

    return SuccessResponse(data=AnalyzeProjectResponse(
        project_id=project_id,
        status="ready",
        summary=ai_result.summary,
        clips_count=len(clips)
    ))

@router.post("/{project_id}/clips", response_model=SuccessResponse[ClipsUpdateData])
def update_clips(project_id: str, payload: ClipsUpdateRequest, db: Session = Depends(get_db)):
    project = ProjectService.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="PROJECT_NOT_FOUND: Project not found")

    updated_count = ProjectService.update_clips(db, project_id, payload.clips)
    return SuccessResponse(data=ClipsUpdateData(updated_count=updated_count))

@router.post("/{project_id}/export", response_model=SuccessResponse[ExportResponse])
def export_project(project_id: str, payload: ExportRequest = None, db: Session = Depends(get_db)):
    project = ProjectService.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="PROJECT_NOT_FOUND: Project not found")

    selected_clips = ProjectService.get_clips_for_project(db, project_id, selected_only=True)
    if not selected_clips:
        selected_clips = ProjectService.get_clips_for_project(db, project_id, selected_only=False)

    if not selected_clips:
        raise HTTPException(status_code=400, detail="NO_CLIPS_FOUND: No clips available for export")

    clip_paths = []
    total_duration = 0.0
    for c in selected_clips:
        total_duration += (c.end_time - c.start_time)
        file_name = f"{project_id}_{c.id}.mp4"
        abs_path = os.path.join(settings.STORAGE_DIR, "clips", file_name)
        clip_paths.append(abs_path)

    export_format = payload.format if payload and payload.format else "9:16"
    exports_dir = os.path.join(settings.STORAGE_DIR, "exports")
    os.makedirs(exports_dir, exist_ok=True)
    export_filename = f"{project_id}_final_export.mp4"
    abs_export_path = os.path.join(exports_dir, export_filename)

    # Concat clips via FFmpeg
    VideoProcessingService.concatenate_clips(clip_paths, abs_export_path)

    download_url = f"/storage/exports/{export_filename}"
    export = ProjectService.create_export(db, project_id, export_format, download_url, total_duration)

    ActivityService.record(
        db,
        project_id=project_id,
        type="export_completed",
        status="completed",
        title="Export completed",
        description="Final 9:16 video clips are ready",
        metadata={"format": export_format, "total_duration": total_duration}
    )

    return SuccessResponse(data=ExportResponse(
        export_id=export.id,
        project_id=project_id,
        status="ready",
        download_url=download_url,
        total_duration=round(total_duration, 2)
    ))


