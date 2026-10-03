# Data Model — CreatorAI (SQLite)

Database engine: **SQLite** via SQLAlchemy ORM (`creator_ai.db`).

## Tables & Schemas

### 1. `projects`
- `id` (VARCHAR(36), PK): UUID string
- `name` (VARCHAR(100), NOT NULL): Project display name
- `status` (VARCHAR(30), DEFAULT 'idle'): idle | uploading | uploaded | analyzing | ready | exporting | completed | failed
- `created_at` (DATETIME): UTC timestamp
- `updated_at` (DATETIME): UTC timestamp

### 2. `assets`
- `id` (VARCHAR(36), PK): UUID string
- `project_id` (VARCHAR(36), FK -> projects.id, NOT NULL)
- `filename` (VARCHAR(255), NOT NULL): Sanitized filename
- `storage_path` (VARCHAR(500), NOT NULL): Relative path (`storage/uploads/...`)
- `mime_type` (VARCHAR(50), NOT NULL): e.g. `video/mp4`
- `file_size` (INTEGER, NOT NULL): Size in bytes
- `duration` (FLOAT, DEFAULT 0.0): Duration in seconds
- `created_at` (DATETIME): UTC timestamp

### 3. `analyses`
- `id` (VARCHAR(36), PK): UUID string
- `project_id` (VARCHAR(36), FK -> projects.id, NOT NULL)
- `summary` (TEXT): High-level summary from Gemini
- `status` (VARCHAR(30)): pending | completed | failed
- `raw_response` (TEXT): JSON response string
- `created_at` (DATETIME): UTC timestamp

### 4. `clips`
- `id` (VARCHAR(36), PK): e.g. `clip_01`
- `project_id` (VARCHAR(36), FK -> projects.id, NOT NULL)
- `position` (INTEGER, NOT NULL): Sequence position 0, 1, 2...
- `start_time` (FLOAT, NOT NULL): Start timestamp in seconds
- `end_time` (FLOAT, NOT NULL): End timestamp in seconds
- `title` (VARCHAR(255), NOT NULL): Headline title
- `reason` (TEXT): AI viral rationale
- `hook` (TEXT, NOT NULL): Selected opening verbal hook
- `caption` (TEXT, NOT NULL): Social media caption
- `confidence` (FLOAT, NOT NULL): Score 0.0 to 1.0
- `clip_path` (VARCHAR(500)): Relative path to generated MP4
- `is_selected` (BOOLEAN, DEFAULT TRUE): Export inclusion toggle
- `created_at` (DATETIME): UTC timestamp

### 5. `exports`
- `id` (VARCHAR(36), PK): UUID string
- `project_id` (VARCHAR(36), FK -> projects.id, NOT NULL)
- `export_path` (VARCHAR(500), NOT NULL): Relative path to stitched MP4
- `format` (VARCHAR(20), DEFAULT '9:16'): 9:16 or 16:9
- `total_duration` (FLOAT, NOT NULL): Duration in seconds
- `status` (VARCHAR(30)): processing | ready | failed
- `created_at` (DATETIME): UTC timestamp
