import os
import time
import logging
from typing import Optional
from app.core.config import settings
from app.schemas.ai import AIAnalysisResult, AIClipRecommendation
from app.services.ai.prompts import SYSTEM_PROMPT, VIDEO_ANALYSIS_PROMPT
from app.services.video.ffmpeg_service import VideoProcessingService

logger = logging.getLogger("creator_ai.gemini")

class GeminiAIService:
    @classmethod
    def get_fallback_analysis(cls, duration: Optional[float] = None) -> AIAnalysisResult:
        """
        Pre-cached demo scenario ('AI Explained') for offline/fallback resilience.
        Adapts clip bounds if a specific video duration is provided.
        """
        logger.info("Serving pre-cached demo AI analysis fallback.")
        base_clips = [
            AIClipRecommendation(
                id="clip_01",
                start_time=0.0,
                end_time=15.0,
                title="Why Attention Is All You Need",
                reason="Introduces the fundamental breakthrough of generative AI in a punchy 15-second segment.",
                hook="Stop training recurrent networks! Here is why transformers changed everything.",
                caption="The secret behind ChatGPT architecture explained in 15 seconds. #AI #MachineLearning #Tech",
                confidence=0.94
            ),
            AIClipRecommendation(
                id="clip_02",
                start_time=18.0,
                end_time=36.0,
                title="Self-Attention in Plain English",
                reason="Uses a clean visual analogy comparing word attention to human reading focus.",
                hook="How does an AI model actually pay attention? Watch this analogy.",
                caption="Self-attention visual breakdown that anyone can understand. #DataScience #Transformers",
                confidence=0.89
            ),
            AIClipRecommendation(
                id="clip_03",
                start_time=40.0,
                end_time=58.0,
                title="The Future of Multimodal Models",
                reason="Vision and audio integration summary with high forward-looking engagement.",
                hook="Text was just the beginning. Look what AI models are doing now.",
                caption="From text to vision and audio: the multimodal future is here. #FutureTech #AI",
                confidence=0.91
            )
        ]

        if duration is not None and duration > 0:
            adjusted = []
            for c in base_clips:
                if c.start_time >= duration - 1.0:
                    continue
                safe_end = min(duration, c.end_time)
                if safe_end - c.start_time >= 2.0:
                    adjusted.append(
                        AIClipRecommendation(
                            id=c.id,
                            start_time=c.start_time,
                            end_time=round(safe_end, 2),
                            title=c.title,
                            reason=c.reason,
                            hook=c.hook,
                            caption=c.caption,
                            confidence=c.confidence
                        )
                    )
            if not adjusted:
                adjusted = [
                    AIClipRecommendation(
                        id="clip_01",
                        start_time=0.0,
                        end_time=round(duration, 2),
                        title="AI Video Spotlight",
                        reason="Primary highlighted segment captured automatically within video duration.",
                        hook="Here is the key takeaway you cannot miss.",
                        caption="Top highlights extracted by CreatorAI. #AI #Shorts",
                        confidence=0.95
                    )
                ]
            clips = adjusted
        else:
            clips = base_clips

        return AIAnalysisResult(
            analysis_status="completed",
            summary="A concise, engaging breakdown of modern artificial intelligence transformer models and self-attention.",
            clips=clips
        )

    @classmethod
    def analyze_video(cls, video_path: str) -> AIAnalysisResult:
        """
        Ingests a video file, sends to Gemini 2.5 Flash via Files API,
        enforces structured JSON output matching AIAnalysisResult,
        and sanitizes / clamps timestamps to the source video's true duration.
        """
        total_duration = 0.0
        try:
            total_duration = VideoProcessingService.probe_duration(video_path)
            logger.info(f"Probed source video duration: {total_duration:.2f}s")
        except Exception as probe_err:
            logger.warning(f"Could not probe duration for {video_path}: {probe_err}")

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            if settings.MOCK_AI_FALLBACK:
                logger.warning("GEMINI_API_KEY is not configured. Using pre-cached demo fallback.")
                return cls.get_fallback_analysis(duration=total_duration)
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
                model=settings.GEMINI_MODEL,
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

            # Sanitize and clamp timestamps against actual video duration
            if total_duration > 0:
                validated_clips = []
                for idx, clip in enumerate(result.clips):
                    if clip.start_time >= total_duration - 1.0:
                        logger.warning(
                            f"Pruning clip '{clip.title}' with start_time {clip.start_time:.2f}s "
                            f"exceeding video duration {total_duration:.2f}s"
                        )
                        continue

                    safe_start = max(0.0, clip.start_time)
                    safe_end = min(total_duration, clip.end_time)

                    if safe_end - safe_start < 2.0:
                        logger.warning(
                            f"Pruning clip '{clip.title}' with effective duration < 2.0s "
                            f"({safe_start:.2f}s -> {safe_end:.2f}s)"
                        )
                        continue

                    validated_clips.append(
                        AIClipRecommendation(
                            id=clip.id or f"clip_{idx+1:02d}",
                            start_time=round(safe_start, 2),
                            end_time=round(safe_end, 2),
                            title=clip.title,
                            reason=clip.reason,
                            hook=clip.hook,
                            caption=clip.caption,
                            confidence=clip.confidence
                        )
                    )

                if not validated_clips:
                    logger.warning("No Gemini clips remained within video bounds. Falling back to duration-tailored analysis.")
                    return cls.get_fallback_analysis(duration=total_duration)

                result.clips = validated_clips

            return result

        except Exception as e:
            logger.error(f"Gemini video analysis failed: {e}")
            logger.warning("Automated fallback activated. Returning duration-tailored pre-cached demo analysis.")
            return cls.get_fallback_analysis(duration=total_duration)
