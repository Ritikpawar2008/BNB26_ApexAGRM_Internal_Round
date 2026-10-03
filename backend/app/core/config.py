import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "CreatorAI Backend"
    API_V1_STR: str = "/api"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    STORAGE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../storage"))
    DATABASE_URL: str = "sqlite:///./creator_ai.db"
    GEMINI_API_KEY: str = ""
    MOCK_AI_FALLBACK: bool = True

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
