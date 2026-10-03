# Development Rules & Coding Standards

1. **Frozen Contracts:** Never modify fields in `docs/API_CONTRACT.md` without team consensus.
2. **Component Reuse:** Always search `frontend/src/components/common/` before writing a new UI component.
3. **Thin Controllers:** FastAPI routes in `app/api/routes/` must strictly orchestrate; business logic belongs in `app/services/`.
4. **Isolated Subprocesses:** All FFmpeg execution must occur inside `VideoProcessingService` using list arguments (`shell=True` banned).
5. **Isolated Gemini Calls:** All Gemini SDK calls must occur inside `GeminiAIService`.
6. **No Leaked Secrets:** `GEMINI_API_KEY` must never be exposed to the frontend or pushed to GitHub.
7. **Conventional Commits:** Use `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.
8. **Git Branching:** Work in feature branches (`feature/frontend-*`, `feature/backend-*`); PRs merge to `develop`.
