from pydantic import BaseModel, Field, model_validator
from typing import List

class AIClipRecommendation(BaseModel):
    id: str = Field(description="Unique clip ID like clip_01")
    start_time: float = Field(description="Start timestamp in seconds from video start")
    end_time: float = Field(description="End timestamp in seconds from video start")
    title: str = Field(description="Punchy headline title")
    reason: str = Field(description="Rationale for viral/engagement potential")
    hook: str = Field(description="Opening verbal hook for first 3 seconds")
    caption: str = Field(description="Social media caption with hashtags")
    confidence: float = Field(default=0.9, description="AI confidence score 0.0 to 1.0")

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
    summary: str = Field(description="2-3 sentence overview of complete video")
    clips: List[AIClipRecommendation] = Field(description="List of recommended clips")
