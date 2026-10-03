import os
import time
import logging
from typing import Optional
from app.core.config import settings
from app.schemas.ai import AIAnalysisResult, AIClipRecommendation
from app.services.ai.prompts import SYSTEM_PROMPT, VIDEO_ANALYSIS_PROMPT

logger = logging.getLogger("creator_ai.gemini")

class GeminiAIService:
    @staticmethod
    def get_fallback_analysis() -> AIAnalysisResult:
        """Pre-cached demo scenario ('AI Explained') for offline/fallback resilience."""
        logger.info("Serving pre-cached demo AI analysis fallback.")
        return AIAnalysisResult(
            analysis_status="completed",
            summary="A concise, engaging breakdown of modern artificial intelligence transformer models and self-attention.",
            clips=[
                AIClipRecommendation(
                    id="clip_01",
                    start_time=12.0,
                    end_time=28.5,
                    title="Why Attention Is All You Need",
                    reason="Introduces the fundamental breakthrough of generative AI in a punchy 16-second segment.",
                    hook="Stop training recurrent networks! Here is why transformers changed everything.",
                    caption="The secret behind ChatGPT architecture explained in 15 seconds. #AI #MachineLearning #Tech",
                    confidence=0.94
                ),
                AIClipRecommendation(
                    id="clip_02",
                    start_time=42.0,
                    end_time=68.0,
                    title="Self-Attention in Plain English",
                    reason="Uses a clean visual analogy comparing word attention to human reading focus.",
                    hook="How does an AI model actually pay attention? Watch this analogy.",
                    caption="Self-attention visual breakdown that anyone can understand. #DataScience #Transformers",
                    confidence=0.89
                ),
                AIClipRecommendation(
                    id="clip_03",
                    start_time=74.0,
                    end_time=88.0,
                    title="The Future of Multimodal Models",
                    reason="Vision and audio integration summary with high forward-looking engagement.",
                    hook="Text was just the beginning. Look what AI models are doing now.",
                    caption="From text to vision and audio: the multimodal future is here. #FutureTech #AI",
                    confidence=0.91
                )
            ]
        )

    @classmethod
    def analyze_video(cls, video_path: str) -> AIAnalysisResult:
        """
        Ingests a video file, sends to Gemini 1.5/2.0 Flash via Files API,
        enforces structured JSON output matching AIAnalysisResult, and validates timestamps.
        """
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            if settings.MOCK_AI_FALLBACK:
                logger.warning("GEMINI_API_KEY is not configured. Using pre-cached demo fallback.")
                return cls.get_fallback_analysis()
            raise ValueError("GEMINI_API_KEY environment variable is required.")

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)

            if not os.path.exists(video_path):
                raise FileNotFoundError(f"Video file not found at path: {video_path}")

            logger.info(f"Uploading video to Gemini Files API: {video_path}")
            video_file = client.files.upload(file=video_path)

            # Wait for video file processing to complete
            max_wait_seconds = 60
            waited = 0
            while video_file.state.name == "PROCESSING":
                time.sleep(3)
                waited += 3
                video_file = client.files.get(name=video_file.name)
                if waited >= max_wait_seconds:
                    raise TimeoutError("Gemini video file processing timed out after 60 seconds.")

            if video_file.state.name != "ACTIVE":
                raise RuntimeError(f"Gemini video file failed to activate: state={video_file.state.name}")

            logger.info("Video active on Gemini. Generating structured content analysis...")

            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[video_file, VIDEO_ANALYSIS_PROMPT],
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=AIAnalysisResult,
                    temperature=0.3,
                ),
            )

            # Clean up remote file from Gemini storage
            try:
                client.files.delete(name=video_file.name)
            except Exception as cleanup_err:
                logger.warning(f"Failed to delete remote Gemini file: {cleanup_err}")

            raw_text = response.text
            logger.info("Received structured JSON from Gemini. Validating with Pydantic...")

            result = AIAnalysisResult.model_validate_json(raw_text)
            return result

        except Exception as e:
            logger.error(f"Gemini video analysis failed: {e}")
            if settings.MOCK_AI_FALLBACK:
                logger.warning("Fallback enabled. Returning pre-cached demo analysis.")
                return cls.get_fallback_analysis()
            raise
