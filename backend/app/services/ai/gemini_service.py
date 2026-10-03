import os
import json
from app.core.config import settings
from app.schemas.ai import AIAnalysisResult, AIClipRecommendation
from app.services.ai.prompts import SYSTEM_PROMPT

class GeminiAIService:
    @staticmethod
    def analyze_video(video_path: str) -> AIAnalysisResult:
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                video_file = client.files.upload(file=video_path)
                
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[video_file, SYSTEM_PROMPT],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=AIAnalysisResult,
                    ),
                )
                if response.text:
                    return AIAnalysisResult.model_validate_json(response.text)
            except Exception as e:
                print(f"[GeminiAIService] Gemini API error, using fallback: {e}")

        # Fallback AI recommendations
        return AIAnalysisResult(
            analysis_status="completed",
            is_fallback=True,
            summary="Educational walkthrough explaining transformer architectures and key concepts.",
            clips=[

                AIClipRecommendation(
                    id="clip_01",
                    start_time=12.0,
                    end_time=28.5,
                    title="Why Attention Is All You Need",
                    reason="Explains transformer breakthrough in 16 seconds.",
                    hook="Stop training recurrent networks! Here is why transformers changed everything.",
                    caption="The secret behind ChatGPT explained. #AI #Tech",
                    confidence=0.94
                ),
                AIClipRecommendation(
                    id="clip_02",
                    start_time=45.0,
                    end_time=62.0,
                    title="Self-Attention Mechanism Explained",
                    reason="Visual breakdown of matrix multiplication in self-attention.",
                    hook="How do AI models actually think? Watch this 15-second breakdown.",
                    caption="Deep dive into self-attention! #MachineLearning #Coding",
                    confidence=0.89
                ),
                AIClipRecommendation(
                    id="clip_03",
                    start_time=75.0,
                    end_time=90.0,
                    title="Future of Generative AI",
                    reason="Strong closing statement about scaling laws and future models.",
                    hook="Is AGI closer than we think? Here is what experts are saying.",
                    caption="The future of AI is unfolding right now. #TechNews #Future",
                    confidence=0.91
                )
            ]
        )

