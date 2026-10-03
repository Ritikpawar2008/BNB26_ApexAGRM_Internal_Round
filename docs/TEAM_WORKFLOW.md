# Team Workflow & Ownership Matrix

## 4-Developer Team Responsibilities

### Member F1 — Frontend Shell & Core
- Application layout (Header, Sidebar, PageContainer)
- Dashboard page & Project Creation modal
- Video Upload page & Dropzone component
- Common UI primitives (`Button`, `Card`, `Modal`, `Input`, `Loading`)
- Centralized API service & Mock data configuration

### Member F2 — Creator Studio & Video Experience
- Creator Studio 3-column layout
- HTML5 VideoPlayer synchronization and scrub controls
- Interactive timeline and clip card list
- Hook and caption editing inspector
- Export screen and final video preview

### Member B1 — Backend Core & Storage
- FastAPI application setup, CORS, routing
- SQLite database configuration and SQLAlchemy ORM models
- Request and response Pydantic schemas
- Local file storage service (`storage/uploads/`, `storage/clips/`, `storage/exports/`)
- API integration testing

### Member B2 — AI & Video Engine
- Google Gemini API integration (`GeminiAIService`)
- Prompt engineering for structured JSON output (`prompts.py`)
- Pydantic schema validation for AI responses
- FFmpeg clip extraction engine (`VideoProcessingService`)
- FFmpeg video concatenation engine (`ExportService`)
