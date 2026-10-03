import os
import re
import shutil
import subprocess
import tempfile
import logging
from typing import List, Tuple, Optional

logger = logging.getLogger("creator_ai.ffmpeg")

def get_ffmpeg_binary() -> str:
    """Finds system FFmpeg or falls back to bundled imageio-ffmpeg executable."""
    sys_bin = shutil.which("ffmpeg")
    if sys_bin:
        return sys_bin
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except (ImportError, Exception):
        pass
    raise RuntimeError(
        "FFmpeg binary not found. Please install FFmpeg on system PATH or pip install imageio-ffmpeg."
    )

class VideoProcessingService:
    @classmethod
    def probe_duration(cls, input_path: str) -> float:
        """Accurately reads the total duration of a video file in seconds."""
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Cannot probe non-existent video: {input_path}")

        ffmpeg_bin = get_ffmpeg_binary()
        cmd = [ffmpeg_bin, "-i", input_path]
        res = subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL)

        match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", res.stderr)
        if match:
            hours, minutes, seconds = map(float, match.groups())
            return hours * 3600 + minutes * 60 + seconds

        logger.warning(f"Could not parse duration for {input_path}; defaulting to 60.0s")
        return 60.0

    @classmethod
    def validate_mp4(cls, file_path: str) -> Tuple[bool, str]:
        """
        Validates an MP4 file's integrity:
        - Confirms physical existence on disk.
        - Confirms file size > 5000 bytes (catches empty 48-byte header stubs).
        - Verifies moov atom presence and decodability via FFmpeg probe.
        """
        if not os.path.exists(file_path):
            return False, "File does not exist"

        file_size = os.path.getsize(file_path)
        if file_size < 5000:
            return False, f"Output file is incomplete or empty ({file_size} bytes)"

        ffmpeg_bin = get_ffmpeg_binary()
        cmd = [ffmpeg_bin, "-v", "error", "-i", file_path, "-t", "0.1", "-f", "null", "-"]
        res = subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL)

        if res.returncode != 0 or "moov atom not found" in res.stderr:
            return False, f"Corrupted container (moov atom missing): {res.stderr.strip()}"

        return True, "OK"

    @classmethod
    def extract_clip_native(
        cls,
        input_path: str,
        start_time: float,
        end_time: float,
        output_path: str
    ) -> str:
        """
        Trims a video segment preserving native aspect ratio.
        Employs atomic file writing (.tmp.mp4) and validates container integrity.
        """
        ffmpeg_bin = get_ffmpeg_binary()
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        total_duration = cls.probe_duration(input_path)
        safe_start = max(0.0, min(start_time, max(0.0, total_duration - 1.0)))
        safe_end = min(total_duration, max(safe_start + 1.0, end_time))
        clip_duration = max(0.5, safe_end - safe_start)

        tmp_output = output_path + ".tmp.mp4"
        if os.path.exists(tmp_output):
            try:
                os.remove(tmp_output)
            except Exception:
                pass

        cmd = [
            ffmpeg_bin,
            "-ss", str(round(safe_start, 2)),
            "-i", input_path,
            "-t", str(round(clip_duration, 2)),
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "22",
            "-c:a", "aac",
            "-b:a", "128k",
            "-avoid_negative_ts", "make_zero",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-y",
            tmp_output
        ]

        logger.info(f"Executing native clip extraction: safe range [{safe_start:.2f}s -> {safe_end:.2f}s]")
        result = subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL)

        is_valid, reason = cls.validate_mp4(tmp_output) if result.returncode == 0 else (False, result.stderr)

        if not is_valid:
            if os.path.exists(tmp_output):
                try:
                    os.remove(tmp_output)
                except Exception:
                    pass
            logger.warning(f"Native extraction failed ({reason}). Triggering fallback extraction pipeline...")
            return cls.extract_clip_fallback(input_path, safe_start, safe_end, output_path, target_format="native")

        # Atomic rename once validated
        if os.path.exists(output_path):
            os.remove(output_path)
        os.replace(tmp_output, output_path)
        return output_path

    @classmethod
    def extract_clip_canvas_stack(
        cls,
        input_path: str,
        start_time: float,
        end_time: float,
        output_path: str
    ) -> str:
        """
        Trims video and formats it into a 9:16 vertical canvas (1080x1920).
        Centers the original video and leaves clean canvas space for hooks/captions.
        Employs atomic file writing (.tmp.mp4) and validates container integrity.
        """
        ffmpeg_bin = get_ffmpeg_binary()
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        total_duration = cls.probe_duration(input_path)
        safe_start = max(0.0, min(start_time, max(0.0, total_duration - 1.0)))
        safe_end = min(total_duration, max(safe_start + 1.0, end_time))
        clip_duration = max(0.5, safe_end - safe_start)

        tmp_output = output_path + ".tmp.mp4"
        if os.path.exists(tmp_output):
            try:
                os.remove(tmp_output)
            except Exception:
                pass

        filter_complex = "scale=1080:-1:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0F172A"

        cmd = [
            ffmpeg_bin,
            "-ss", str(round(safe_start, 2)),
            "-i", input_path,
            "-t", str(round(clip_duration, 2)),
            "-vf", filter_complex,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "22",
            "-c:a", "aac",
            "-b:a", "128k",
            "-avoid_negative_ts", "make_zero",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-y",
            tmp_output
        ]

        logger.info(f"Executing 9:16 Canvas Stack extraction: safe range [{safe_start:.2f}s -> {safe_end:.2f}s]")
        result = subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL)

        is_valid, reason = cls.validate_mp4(tmp_output) if result.returncode == 0 else (False, result.stderr)

        if not is_valid:
            if os.path.exists(tmp_output):
                try:
                    os.remove(tmp_output)
                except Exception:
                    pass
            logger.warning(f"Canvas Stack failed ({reason}). Triggering fallback extraction pipeline...")
            return cls.extract_clip_fallback(input_path, safe_start, safe_end, output_path, target_format="9:16")

        # Atomic rename once validated
        if os.path.exists(output_path):
            os.remove(output_path)
        os.replace(tmp_output, output_path)
        return output_path

    @classmethod
    def extract_clip_fallback(
        cls,
        input_path: str,
        start_time: float,
        end_time: float,
        output_path: str,
        target_format: str = "native"
    ) -> str:
        """
        Resilient Fallback Pipeline:
        - Accurately seeks with input placed before -ss to guarantee frame synchronization.
        - Recalculates safe bounds to prevent EOF issues.
        - Employs ultrafast encoding profile with explicit moov atom placement.
        """
        logger.info(f"Running automated fallback extraction on: {input_path}")
        ffmpeg_bin = get_ffmpeg_binary()

        total_duration = cls.probe_duration(input_path)
        safe_start = max(0.0, min(start_time, max(0.0, total_duration - 1.0)))
        safe_end = min(total_duration, max(safe_start + 0.5, end_time))

        tmp_output = output_path + ".fallback.mp4"
        if os.path.exists(tmp_output):
            try:
                os.remove(tmp_output)
            except Exception:
                pass

        cmd = [
            ffmpeg_bin,
            "-i", input_path,
            "-ss", str(round(safe_start, 2)),
            "-to", str(round(safe_end, 2)),
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "128k",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-y",
            tmp_output
        ]

        if target_format == "9:16":
            cmd.insert(-3, "-vf")
            cmd.insert(-3, "scale=1080:-1:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0F172A")

        subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL)

        is_valid, reason = cls.validate_mp4(tmp_output)
        if not is_valid:
            if os.path.exists(tmp_output):
                os.remove(tmp_output)
            raise RuntimeError(f"Both primary and fallback clip extractions failed: {reason}")

        if os.path.exists(output_path):
            os.remove(output_path)
        os.replace(tmp_output, output_path)
        logger.info(f"Automated fallback extraction succeeded: {output_path}")
        return output_path

    @classmethod
    def extract_clip(
        cls,
        input_path: str,
        start_time: float,
        end_time: float,
        output_path: str,
        target_format: str = "native"
    ) -> str:
        """Unified entrypoint: dispatches to native or 9:16 vertical canvas stack with fallback."""
        if target_format == "9:16":
            return cls.extract_clip_canvas_stack(input_path, start_time, end_time, output_path)
        return cls.extract_clip_native(input_path, start_time, end_time, output_path)

    @classmethod
    def concatenate_clips(cls, clip_paths: List[str], output_path: str) -> str:
        """
        Concatenates an ordered list of clips using the high-speed FFmpeg concat demuxer.
        Automatically verifies clip files and filters out corrupted inputs.
        """
        valid_clips = []
        for cp in clip_paths:
            is_valid, msg = cls.validate_mp4(cp)
            if is_valid:
                valid_clips.append(cp)
            else:
                logger.warning(f"Skipping corrupted clip during export concatenation: {cp} ({msg})")

        if not valid_clips:
            raise ValueError("No valid, uncorrupted clips available for concatenation.")

        ffmpeg_bin = get_ffmpeg_binary()
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
            manifest_path = f.name
            for clip in valid_clips:
                safe_path = os.path.abspath(clip).replace("\\", "/")
                f.write(f"file '{safe_path}'\n")

        tmp_output = output_path + ".tmp.mp4"

        try:
            cmd = [
                ffmpeg_bin,
                "-f", "concat",
                "-safe", "0",
                "-i", manifest_path,
                "-c", "copy",
                "-movflags", "+faststart",
                "-y",
                tmp_output
            ]

            logger.info(f"Executing clip concatenation: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL)

            if result.returncode != 0:
                logger.error(f"FFmpeg concat failed (code {result.returncode}): {result.stderr}")
                raise RuntimeError(f"FFmpeg concat failed: {result.stderr[-300:]}")

            is_valid, reason = cls.validate_mp4(tmp_output)
            if not is_valid:
                raise RuntimeError(f"Stitched export failed validation: {reason}")

            if os.path.exists(output_path):
                os.remove(output_path)
            os.replace(tmp_output, output_path)
            return output_path

        finally:
            if os.path.exists(manifest_path):
                try:
                    os.remove(manifest_path)
                except Exception as err:
                    logger.warning(f"Failed to remove temp manifest: {err}")
            if os.path.exists(tmp_output):
                try:
                    os.remove(tmp_output)
                except Exception:
                    pass

    @classmethod
    def heal_corrupted_clips(cls, clips_dir: str) -> List[str]:
        """Scans a directory, detects any invalid or incomplete MP4s, and purges them."""
        removed = []
        if not os.path.exists(clips_dir):
            return removed

        for filename in os.listdir(clips_dir):
            if filename.endswith(".mp4"):
                full_path = os.path.join(clips_dir, filename)
                is_valid, msg = cls.validate_mp4(full_path)
                if not is_valid:
                    logger.warning(f"Healer detected corrupt clip: {filename} ({msg}). Removing.")
                    try:
                        os.remove(full_path)
                        removed.append(full_path)
                    except Exception as e:
                        logger.error(f"Failed to remove corrupt clip {full_path}: {e}")
        return removed
