from pydantic import BaseModel, Field
from typing import List

class AIClipRecommendation(BaseModel):
    id: str = Field(description="Unique clip ID like clip_01")
    start_time: float = Field(ge=0.0, description="Start timestamp in seconds")
    end_time: float = Field(gt=0.0, description="End timestamp in seconds")
    title: str = Field(min_length=3, max_length=100)
    reason: str = Field(min_length=5)
    hook: str = Field(min_length=5)
    caption: str = Field(min_length=5)
    confidence: float = Field(ge=0.0, le=1.0)

class AIAnalysisResult(BaseModel):
    analysis_status: str = "completed"
    summary: str
    clips: List[AIClipRecommendation]
    is_fallback: bool = False

