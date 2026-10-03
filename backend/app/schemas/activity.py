from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ActivityItem(BaseModel):
    id: str
    type: str
    status: str
    title: str
    description: Optional[str] = None
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ActivityListResponse(BaseModel):
    activities: List[ActivityItem]
