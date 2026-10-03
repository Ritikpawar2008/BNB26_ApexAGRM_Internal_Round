# CreatorAI — AI-Powered Creator Operating Platform

> **Hackathon Minimum Viable Product (MVP)**  
> Architecture: Modular Monolith | Tech: React (Vite + TS) + FastAPI + Google Gemini + FFmpeg + SQLite

---

## Quickstart Guide

### 1. Prerequisites
- **Node.js** v18+ and **npm** v9+
- **Python** v3.11+
- **FFmpeg** installed and accessible on system PATH (`ffmpeg -version`)

---

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows activate:
.\venv\Scripts\activate
# Mac/Linux activate:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI development server:
uvicorn app.main:app --reload --port 8000
```
Backend API will be available at: `http://localhost:8000`  
Interactive Swagger docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup
```bash
cd frontend
npm install

# Run Vite development server:
npm run dev
```
Frontend will be available at: `http://localhost:5173`

---

## Documentation Links
- [`PROJECT_SPEC.md`](PROJECT_SPEC.md) — Mandatory onboarding specification
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture & pipelines
- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) — Complete frozen REST API contract
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — Database schema and entities
- [`docs/DEVELOPMENT_RULES.md`](docs/DEVELOPMENT_RULES.md) — Coding standards & Git workflow
- [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md) — MVP vs Post-MVP boundaries
- [`docs/TEAM_WORKFLOW.md`](docs/TEAM_WORKFLOW.md) — Team roles & ownership matrix
