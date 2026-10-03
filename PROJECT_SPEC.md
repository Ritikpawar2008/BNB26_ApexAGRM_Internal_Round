# CreatorAI — Technical Project Specification & Onboarding Guide

**Status:** FROZEN ARCHITECTURE  
**Target:** Hackathon Minimum Viable Product (MVP)  
**Team Structure:** 4 Beginner Developers (Frontend: F1, F2 | Backend & AI: B1, B2)  
**Design Reference:** Refero UI Design Specs in `design/`  

---

## 1. Project Overview & Mission
CreatorAI is an AI-powered creator operating platform designed to eliminate the most time-consuming bottleneck in content creation: **transforming raw long-form videos into high-impact, platform-optimized short clips with viral hooks and captions**.

### The Problem
- Creators spend 3–6 hours manually scrubbing 15-minute videos to find 30-second clips.
- Existing tools are either disconnected (transcribers vs. copywriters vs. editors) or black-box automations that offer zero editorial control.

### The Solution
CreatorAI automates video understanding using **Google Gemini** (detecting viral moments, writing hooks, drafting captions) while **keeping the creator in editorial control** inside an interactive **Creator Studio** before generating exports with **FFmpeg**.

---

## 2. Frozen MVP Scope & Workflow
The MVP strictly implements this unidirectional pipeline:
1. **Video Upload:** User uploads video (MP4/MOV, up to 100MB).
2. **AI Video Analysis:** Gemini multimodal API processes semantics, audio, and pacing.
3. **Structured Recommendations:** Gemini returns structured JSON with 1–5 clips, opening hooks, captions, and viral confidence scores.
4. **Clip Generation:** FFmpeg extracts clips to `backend/storage/clips/`.
5. **Creator Studio:** Creator previews clips, scrubs timeline, edits hooks/captions, and reorders clips.
6. **Export:** FFmpeg stitches selected clips in order into a downloadable 9:16 vertical video.

### Non-MVP / Out of Scope (POST-MVP)
- No professional multi-track video editor (transitions, keyframes, audio mixer).
- No payment, billing, or subscription tiers.
- No social OAuth (Google, TikTok, YouTube).
- No direct social publishing APIs.
- No multi-user real-time collaboration.
- No microservices, Docker Swarm, or Kubernetes.
- No multiple databases (Postgres, Mongo, Redis).

---

## 3. Team Ownership Matrix
- **Member F1 (Frontend Core & Shell):** Routing, App layout (Sidebar, Header), Dashboard (`/`), Upload flow (`/projects/new`), shared UI components (`Button`, `Card`, `Modal`, `Input`), centralized API client with mock toggle.
- **Member F2 (Creator Studio & Video UI):** Creator Studio (`/projects/:id/studio`), VideoPlayer synchronization, interactive Timeline, Clip cards, Hook/Caption inspector, Export UI (`/projects/:id/export`).
- **Member B1 (Backend Core & Database):** FastAPI application setup, SQLite database & SQLAlchemy ORM, API routes, request/response Pydantic schemas, file storage management (`storage/`).
- **Member B2 (AI & Video Processing):** Google Gemini API integration, prompt templates, structured JSON schema validation, FFmpeg clip cutting, FFmpeg concat export.

---

## 4. The 16 Golden Consistency Rules
1. **Architecture is Immutable:** Do not alter the Modular Monolith or introduce microservices.
2. **Contracts Precede Code:** Never modify API endpoints or JSON fields without updating `docs/API_CONTRACT.md`.
3. **No Duplicate Components:** Check `frontend/src/components/common/` before creating UI elements.
4. **Refero is Law:** Consult Refero design markdown files in `design/` before styling any screen.
5. **Zero Hardcoded Colors:** Always use design tokens from `frontend/src/constants/theme.ts`.
6. **Centralize AI Prompts:** All system and user prompts reside in `backend/app/services/ai/prompts.py`.
7. **Isolate Gemini Logic:** Only `GeminiAIService` may import or call Google GenAI SDK.
8. **Isolate FFmpeg Logic:** Only `VideoProcessingService` may execute `subprocess.run(["ffmpeg", ...])`.
9. **Isolate Database Access:** Route handlers must never write SQL; use SQLAlchemy services.
10. **Zero Secrets in Git:** Never commit `.env` or API keys. Always use `.env.example`.
11. **No Unapproved Dependencies:** Do not add npm or pip packages without consulting the team.
12. **Radical Simplicity:** Avoid premature abstraction. Prefer readable code over complex generics.
13. **Thin Controllers:** Route handlers must not exceed 25 lines of code.
14. **Always Handle Three States:** Every UI component handling async data must implement Loading, Error, and Empty states.
15. **Document Architectural Shifts:** Any approved structural change must be recorded in `docs/ARCHITECTURE.md`.
16. **Rehearse the Golden Path:** Never push code to `main` without verifying the unbroken demo flow.

---

## 5. Antigravity Working Protocol
Every time an AI assistant or developer modifies the code:
1. Read `PROJECT_SPEC.md` and `docs/API_CONTRACT.md` first.
2. Inspect existing components and services; reuse wherever possible.
3. Make surgical edits; never rewrite unrelated modules.
4. Strictly preserve frozen API and schema contracts.
5. Report changed files, dependencies, and contract impacts upon completion.
