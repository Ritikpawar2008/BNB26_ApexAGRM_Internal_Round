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

def test_validate_mp4_success(sample_video):
    is_valid, msg = VideoProcessingService.validate_mp4(sample_video)
    assert is_valid is True
    assert msg == "OK"

def test_validate_mp4_non_existent():
    is_valid, msg = VideoProcessingService.validate_mp4("storage/non_existent_file_12345.mp4")
    assert is_valid is False
    assert "does not exist" in msg

def test_validate_mp4_empty_stub(tmp_path):
    # Simulates the 48-byte container stub that occurred previously
    stub_file = os.path.join(tmp_path, "stub.mp4")
    with open(stub_file, "wb") as f:
        f.write(b"\x00" * 48)

    is_valid, msg = VideoProcessingService.validate_mp4(stub_file)
    assert is_valid is False
    assert "incomplete or empty" in msg

def test_validate_mp4_missing_moov_atom(tmp_path):
    # Simulates a file >= 5000 bytes with invalid/missing moov atom
    corrupt_file = os.path.join(tmp_path, "corrupt_no_moov.mp4")
    with open(corrupt_file, "wb") as f:
        f.write(b"NOT_A_VALID_MP4_HEADER" * 300)  # ~6600 bytes

    is_valid, msg = VideoProcessingService.validate_mp4(corrupt_file)
    assert is_valid is False
    assert "moov atom missing" in msg

def test_extraction_beyond_duration_bounds(sample_video, tmp_path):
    # Tests that start_time beyond source video duration does not produce a corrupted 48-byte stub
    output_clip = os.path.join(tmp_path, "clip_eof_recovery.mp4")
    result = VideoProcessingService.extract_clip_native(
        input_path=sample_video,
        start_time=10.0,  # source is only 6 seconds
        end_time=15.0,
        output_path=output_clip
    )
    assert os.path.exists(result)
    is_valid, msg = VideoProcessingService.validate_mp4(result)
    assert is_valid is True, f"Recovered clip failed validation: {msg}"

def test_heal_corrupted_clips(sample_video, tmp_path):
    heal_dir = tmp_path / "heal_test"
    heal_dir.mkdir()

    # 1. Create a valid clip
    valid_clip = str(heal_dir / "valid_clip.mp4")
    VideoProcessingService.extract_clip_native(sample_video, 1.0, 2.0, valid_clip)

    # 2. Create a 48-byte stub
    stub_clip = str(heal_dir / "stub_corrupted.mp4")
    with open(stub_clip, "wb") as f:
        f.write(b"\x00" * 48)

    # 3. Create a >5KB corrupt file
    corrupt_clip = str(heal_dir / "moov_corrupted.mp4")
    with open(corrupt_clip, "wb") as f:
        f.write(b"CORRUPT_BYTES" * 500)

    # Run healer
    removed = VideoProcessingService.heal_corrupted_clips(str(heal_dir))

    assert len(removed) == 2
    assert stub_clip in removed
    assert corrupt_clip in removed
    assert os.path.exists(valid_clip)
    assert not os.path.exists(stub_clip)
    assert not os.path.exists(corrupt_clip)
