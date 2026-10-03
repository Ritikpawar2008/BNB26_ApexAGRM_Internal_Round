# System Architecture — CreatorAI

## Overview
CreatorAI is designed as a **Simple Modular Monolith**. It consists of a React single-page frontend application interacting with a single FastAPI backend server through REST APIs.

```
┌──────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                │
│    Dashboard  │  Upload  │  Analysis  │  Studio  │ Export│
│                            │                             │
│                  Centralized API Client                  │
│               (Mock Data ◄──► Real REST)                 │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTP / JSON
                             ▼
┌──────────────────────────────────────────────────────────┐
│                 BACKEND (FastAPI Monolith)               │
│  API Routes: /projects, /upload, /analyze, /clips, etc.  │
│  Pydantic Schema Validation Layer                        │
│  Service Layer:                                          │
│    ├── ProjectService (Lifecycle & DB mutations)         │
│    ├── FileService (storage/ uploads, clips, exports)    │
│    ├── GeminiAIService (Multimodal analysis & JSON)      │
│    ├── VideoProcessingService (FFmpeg trimming)          │
│    └── ExportService (FFmpeg concat stitcher)            │
│  Persistence: SQLite (creator_ai.db) + Filesystem        │
└──────────────────────────────────────────────────────────┘
```

## AI Pipeline Data Flow
1. User uploads raw video -> saved to `backend/storage/uploads/{project_id}_source.mp4`.
2. Backend calls `GeminiAIService.analyze_video()` using Gemini Files API.
3. Gemini processes video semantics and audio, returning structured JSON (`AIAnalysisResult`).
4. Backend parses and validates JSON via Pydantic (`backend/app/schemas/ai.py`).
5. Backend invokes `VideoProcessingService.extract_clip()` to generate individual MP4 clips in `backend/storage/clips/`.
6. Clips and hooks are saved in SQLite.
7. Frontend renders Creator Studio.
8. Creator edits/reorders and triggers export.
9. `ExportService` concatenates clips via FFmpeg concat demuxer into `backend/storage/exports/`.
