import pytest
from pydantic import ValidationError
from app.schemas.ai import AIAnalysisResult, AIClipRecommendation
from app.services.ai.gemini_service import GeminiAIService

def test_valid_ai_analysis_parsing():
    raw_json = """{
        "analysis_status": "completed",
        "summary": "Educational walkthrough explaining transformer neural networks.",
        "clips": [
            {
                "id": "clip_01",
                "start_time": 10.0,
                "end_time": 25.5,
                "title": "Why Attention Works",
                "reason": "Clear explanation of self-attention mechanism.",
                "hook": "Attention is the secret to all modern LLMs.",
                "caption": "How transformers actually understand context. #AI #Tech",
                "confidence": 0.95
            }
        ]
    }"""
    result = AIAnalysisResult.model_validate_json(raw_json)
    assert result.analysis_status == "completed"
    assert len(result.clips) == 1
    clip = result.clips[0]
    assert clip.id == "clip_01"
    assert clip.start_time == 10.0
    assert clip.end_time == 25.5
    assert clip.duration == 15.5
    assert clip.confidence == 0.95

def test_invalid_timestamps_raise_validation_error():
    # end_time <= start_time must fail validation
    with pytest.raises(ValidationError):
        AIClipRecommendation(
            id="clip_bad",
            start_time=30.0,
            end_time=20.0,  # Invalid!
            title="Bad Timestamp Clip",
            reason="Test invalid bounds",
            hook="This should fail validation",
            caption="Failing caption #Test",
            confidence=0.5
        )

def test_fallback_analysis_structure():
    fallback = GeminiAIService.get_fallback_analysis()
    assert fallback.analysis_status == "completed"
    assert len(fallback.clips) == 3
    for clip in fallback.clips:
        assert clip.end_time > clip.start_time
        assert 0.0 <= clip.confidence <= 1.0
        assert len(clip.hook) >= 5
        assert len(clip.caption) >= 5

def test_fallback_analysis_duration_clamping():
    # When given a 50s duration, clips must strictly be <= 50.0s
    res_50 = GeminiAIService.get_fallback_analysis(duration=50.0)
    for c in res_50.clips:
        assert c.start_time < 50.0
        assert c.end_time <= 50.0
        assert c.end_time > c.start_time

    # When given an ultra-short video (e.g. 8s), at least one clip within 8s is generated
    res_8 = GeminiAIService.get_fallback_analysis(duration=8.0)
    assert len(res_8.clips) >= 1
    for c in res_8.clips:
        assert c.start_time >= 0.0
        assert c.end_time <= 8.0

