from pydantic import BaseModel, Field
from typing import Optional

class ClipUpdateRequest(BaseModel):
    id: str
    position: Optional[int] = None
    hook: Optional[str] = None
    caption: Optional[str] = None
    is_selected: Optional[bool] = None

class ClipResponse(BaseModel):
    id: str
    position: int
    start_time: float
    end_time: float
    title: str
    reason: Optional[str] = None
    hook: str
    caption: str
    confidence: float
    url: Optional[str] = None
    is_selected: bool

    class Config:
        from_attributes = True
