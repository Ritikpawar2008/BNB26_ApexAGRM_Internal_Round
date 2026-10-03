import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from app.core.config import settings
from app.api.api_router import api_router
from app.database.session import engine
from app.database.base import Base

# Initialize SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Custom Exception Handler for Standard Error Envelopes
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    detail = str(exc.detail)
    code = "ERROR"
    message = detail
    if ":" in detail:
        parts = detail.split(":", 1)
        code = parts[0].strip()
        message = parts[1].strip()
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message,
                "details": None
            }
        }
    )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Static media storage mount
storage_path = settings.STORAGE_DIR
os.makedirs(storage_path, exist_ok=True)
app.mount("/storage", StaticFiles(directory=storage_path), name="storage")

@app.get("/")
def root():
    return {"message": "CreatorAI API is running", "docs": "/docs"}

