from pydantic import BaseModel, Field, model_validator
from typing import List

class AIClipRecommendation(BaseModel):
    id: str = Field(description="Unique clip ID like clip_01")
    start_time: float = Field(ge=0.0, description="Start timestamp in seconds from video start")
    end_time: float = Field(gt=0.0, description="End timestamp in seconds from video start")
    title: str = Field(min_length=3, max_length=100, description="Punchy headline title")
    reason: str = Field(min_length=5, description="Rationale for viral/engagement potential")
    hook: str = Field(min_length=5, description="Opening verbal hook for first 3 seconds")
    caption: str = Field(min_length=5, description="Social media caption with hashtags")
    confidence: float = Field(ge=0.0, le=1.0, description="AI confidence score 0.0 to 1.0")

    @model_validator(mode="after")
    def validate_timestamps(self):
        if self.end_time <= self.start_time:
            raise ValueError(f"end_time ({self.end_time}) must be strictly greater than start_time ({self.start_time})")
        return self

    @property
    def duration(self) -> float:
        return round(self.end_time - self.start_time, 2)

class AIAnalysisResult(BaseModel):
    analysis_status: str = Field(default="completed", description="Status string: completed")
    summary: str = Field(min_length=10, description="2-3 sentence overview of complete video")
    clips: List[AIClipRecommendation] = Field(min_length=1, description="List of recommended clips")
