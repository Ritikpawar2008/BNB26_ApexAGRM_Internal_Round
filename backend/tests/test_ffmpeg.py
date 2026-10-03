import os
import subprocess
import pytest
from app.services.video.ffmpeg_service import VideoProcessingService, get_ffmpeg_binary

@pytest.fixture(scope="module")
def sample_video(tmp_path_factory):
    """Generates a synthetic 6-second MP4 test video with audio using FFmpeg."""
    tmp_dir = tmp_path_factory.mktemp("video_test")
    input_file = os.path.join(tmp_dir, "synthetic_source.mp4")

    ffmpeg_bin = get_ffmpeg_binary()
    cmd = [
        ffmpeg_bin,
        "-f", "lavfi", "-i", "testsrc=duration=6:size=1280x720:rate=25",
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        "-c:v", "libx264", "-preset", "ultrafast",
        "-c:a", "aac",
        "-shortest",
        "-y",
        input_file
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    assert res.returncode == 0, f"Failed to generate synthetic test video: {res.stderr}"
    assert os.path.exists(input_file)
    return input_file

def test_ffmpeg_binary_discovery():
    bin_path = get_ffmpeg_binary()
    assert os.path.exists(bin_path)

def test_native_clip_extraction(sample_video, tmp_path):
    output_clip = os.path.join(tmp_path, "clip_native.mp4")
    result = VideoProcessingService.extract_clip_native(
        input_path=sample_video,
        start_time=1.0,
        end_time=3.0,
        output_path=output_clip
    )
    assert os.path.exists(result)
    assert os.path.getsize(result) > 1000

def test_canvas_stack_clip_extraction(sample_video, tmp_path):
    output_clip = os.path.join(tmp_path, "clip_canvas_9x16.mp4")
    result = VideoProcessingService.extract_clip_canvas_stack(
        input_path=sample_video,
        start_time=2.0,
        end_time=4.5,
        output_path=output_clip
    )
    assert os.path.exists(result)
    assert os.path.getsize(result) > 1000

def test_clip_concatenation(sample_video, tmp_path):
    clip1 = os.path.join(tmp_path, "c1.mp4")
    clip2 = os.path.join(tmp_path, "c2.mp4")
    final_export = os.path.join(tmp_path, "final_stitched.mp4")

    VideoProcessingService.extract_clip_native(sample_video, 0.5, 2.0, clip1)
    VideoProcessingService.extract_clip_native(sample_video, 3.0, 4.5, clip2)

    result = VideoProcessingService.concatenate_clips([clip1, clip2], final_export)
    assert os.path.exists(result)
    assert os.path.getsize(result) > 2000
