import os
import shutil
import subprocess
import tempfile
import logging
from typing import List, Optional

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
    @staticmethod
    def extract_clip_native(
        input_path: str,
        start_time: float,
        end_time: float,
        output_path: str
    ) -> str:
        """
        Trims a video segment from start_time to end_time preserving native aspect ratio.
        Uses fast seek and stream copy/re-encode with web-compatible codecs (H.264 / AAC).
        """
        ffmpeg_bin = get_ffmpeg_binary()
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        duration = max(0.5, end_time - start_time)

        cmd = [
            ffmpeg_bin,
            "-ss", str(round(start_time, 2)),
            "-i", input_path,
            "-t", str(round(duration, 2)),
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "22",
            "-c:a", "aac",
            "-b:a", "128k",
            "-avoid_negative_ts", "make_zero",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-y",
            output_path
        ]

        logger.info(f"Executing native clip extraction: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            logger.error(f"FFmpeg extract failed (code {result.returncode}): {result.stderr}")
            raise RuntimeError(f"FFmpeg clip extraction failed: {result.stderr[-300:]}")

        return output_path

    @staticmethod
    def extract_clip_canvas_stack(
        input_path: str,
        start_time: float,
        end_time: float,
        output_path: str
    ) -> str:
        """
        Trims video and formats it into a 9:16 vertical canvas (1080x1920).
        The original video is scaled to fit centered in the middle without cropping,
        leaving clean canvas space above and below for the hook headline and captions.
        """
        ffmpeg_bin = get_ffmpeg_binary()
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        duration = max(0.5, end_time - start_time)

        # Scale original video to max 1080 width while preserving aspect ratio,
        # then pad to 1080x1920 centered on a clean dark canvas.
        filter_complex = "scale=1080:-1:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0F172A"

        cmd = [
            ffmpeg_bin,
            "-ss", str(round(start_time, 2)),
            "-i", input_path,
            "-t", str(round(duration, 2)),
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
            output_path
        ]

        logger.info(f"Executing 9:16 Canvas Stack extraction: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            logger.error(f"FFmpeg Canvas Stack failed (code {result.returncode}): {result.stderr}")
            raise RuntimeError(f"FFmpeg Canvas Stack failed: {result.stderr[-300:]}")

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
        """Unified entrypoint: dispatches to native or 9:16 vertical canvas stack."""
        if target_format == "9:16":
            return cls.extract_clip_canvas_stack(input_path, start_time, end_time, output_path)
        return cls.extract_clip_native(input_path, start_time, end_time, output_path)

    @staticmethod
    def concatenate_clips(clip_paths: List[str], output_path: str) -> str:
        """
        Concatenates an ordered list of clips using the high-speed FFmpeg concat demuxer.
        Takes < 2 seconds because it copies streams directly without re-encoding.
        """
        if not clip_paths:
            raise ValueError("No clip paths provided for concatenation.")

        ffmpeg_bin = get_ffmpeg_binary()
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        # Create temporary concat list manifest
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
            manifest_path = f.name
            for clip in clip_paths:
                # Normalizing forward slashes for cross-platform FFmpeg path resolution
                safe_path = os.path.abspath(clip).replace("\\", "/")
                f.write(f"file '{safe_path}'\n")

        try:
            cmd = [
                ffmpeg_bin,
                "-f", "concat",
                "-safe", "0",
                "-i", manifest_path,
                "-c", "copy",
                "-movflags", "+faststart",
                "-y",
                output_path
            ]

            logger.info(f"Executing clip concatenation: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode != 0:
                logger.error(f"FFmpeg concat failed (code {result.returncode}): {result.stderr}")
                raise RuntimeError(f"FFmpeg concat failed: {result.stderr[-300:]}")

            return output_path

        finally:
            if os.path.exists(manifest_path):
                try:
                    os.remove(manifest_path)
                except Exception as err:
                    logger.warning(f"Failed to remove temp manifest: {err}")
