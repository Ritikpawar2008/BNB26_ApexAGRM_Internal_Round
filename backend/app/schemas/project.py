from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.clip import ClipResponse

class ProjectCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class ProjectResponse(BaseModel):
    id: str
    name: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AssetDetailResponse(BaseModel):
    id: str
    filename: str
    url: str
    duration: float

    class Config:
        from_attributes = True

class UploadAssetResponse(BaseModel):
    asset_id: str
    project_id: str
    filename: str
    file_size: int
    mime_type: str
    duration: float
    status: str

class ProjectDetailResponse(BaseModel):
    id: str
    name: str
    status: str
    asset: Optional[AssetDetailResponse] = None
    clips: List[ClipResponse] = []

    class Config:
        from_attributes = True

class AnalyzeProjectResponse(BaseModel):
    project_id: str
    status: str
    summary: str
    clips_count: int

class ExportRequest(BaseModel):
    format: Optional[str] = "9:16"
    resolution: Optional[str] = "1080p"

class ExportResponse(BaseModel):
    export_id: str
    project_id: str
    status: str
    download_url: str
    total_duration: float

