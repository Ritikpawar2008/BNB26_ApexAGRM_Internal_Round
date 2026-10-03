from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

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
