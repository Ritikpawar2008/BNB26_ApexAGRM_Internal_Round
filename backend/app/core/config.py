import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

backend_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "CreatorAI Backend"
    API_V1_STR: str = "/api"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    STORAGE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../storage"))
    DATABASE_URL: str = f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '../../creator_ai.db')).replace(chr(92), '/')}"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    MOCK_AI_FALLBACK: bool = True
    DEMO_MODE: bool = True

    model_config = SettingsConfigDict(
        env_file=[backend_env, root_env, ".env"],
        extra="allow"
    )

settings = Settings()
