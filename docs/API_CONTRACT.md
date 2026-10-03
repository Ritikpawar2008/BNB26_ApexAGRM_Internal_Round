# API Contract — CreatorAI (FROZEN)

All responses return standard JSON envelopes.

## Standard Envelopes
### Success:
```json
{
  "success": true,
  "data": { ... }
}
```
### Error:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error description",
    "details": null
  }
}
```

---

## Endpoints

### 1. Create Project
- **Method & URL:** `POST /api/projects`
- **Request:** `{ "name": "Explaining AI Transformers" }`
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "proj_9f8b2a1c",
    "name": "Explaining AI Transformers",
    "status": "idle",
    "created_at": "2026-10-03T18:00:00Z",
    "updated_at": "2026-10-03T18:00:00Z"
  }
}
```

### 2. Upload Video Asset
- **Method & URL:** `POST /api/projects/{project_id}/upload`
- **Content-Type:** `multipart/form-data` (file: binary video)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "asset_id": "asset_4a7c1e",
    "project_id": "proj_9f8b2a1c",
    "filename": "lecture.mp4",
    "file_size": 45219800,
    "mime_type": "video/mp4",
    "duration": 92.5,
    "status": "uploaded"
  }
}
```

### 3. Trigger Video Analysis
- **Method & URL:** `POST /api/projects/{project_id}/analyze`
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "project_id": "proj_9f8b2a1c",
    "status": "ready",
    "summary": "Educational walkthrough explaining transformer architectures.",
    "clips_count": 3
  }
}
```

### 4. Get Project Details
- **Method & URL:** `GET /api/projects/{project_id}`
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "proj_9f8b2a1c",
    "name": "Explaining AI Transformers",
    "status": "ready",
    "asset": {
      "id": "asset_4a7c1e",
      "filename": "lecture.mp4",
      "url": "/storage/uploads/proj_9f8b2a1c_source.mp4",
      "duration": 92.5
    },
    "clips": [
      {
        "id": "clip_01",
        "position": 0,
        "start_time": 12.0,
        "end_time": 28.5,
        "title": "Why Attention Is All You Need",
        "reason": "Explains transformer breakthrough in 16 seconds.",
        "hook": "Stop training recurrent networks! Here is why transformers changed everything.",
        "caption": "The secret behind ChatGPT explained. #AI #Tech",
        "confidence": 0.94,
        "url": "/storage/clips/proj_9f8b2a1c_clip_01.mp4",
        "is_selected": true
      }
    ]
  }
}
```

### 5. Update & Reorder Clips
- **Method & URL:** `POST /api/projects/{project_id}/clips`
- **Request:**
```json
{
  "clips": [
    {
      "id": "clip_01",
      "position": 0,
      "hook": "Updated hook text",
      "caption": "Updated caption text",
      "is_selected": true
    }
  ]
}
```
- **Response (200):** `{ "success": true, "data": { "updated_count": 1 } }`

### 6. Export Final Video
- **Method & URL:** `POST /api/projects/{project_id}/export`
- **Request:** `{ "format": "9:16", "resolution": "1080p" }`
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "export_id": "exp_7b3a9c",
    "project_id": "proj_9f8b2a1c",
    "status": "ready",
    "download_url": "/storage/exports/proj_9f8b2a1c_final_export.mp4",
    "total_duration": 28.5
  }
}
```

### 7. Health Check
- **Method & URL:** `GET /api/health`
- **Response (200):** `{ "status": "healthy", "ffmpeg": true, "database": true }`
