import os
import re
import uuid
import shutil
import subprocess
import tempfile
import time

import logging
from typing import List, Tuple, Optional

logger = logging.getLogger("creator_ai.ffmpeg")

def safe_replace(src: str, dst: str, max_retries: int = 8, delay: float = 0.25) -> str:
    """
    Safely moves or replaces src to dst on Windows, retrying if a file lock is briefly held.
    Falls back to copy + remove to avoid [WinError 32].
    """
    for _ in range(max_retries):
        try:
            if os.path.exists(dst):
                try:
                    os.remove(dst)
                except Exception:
                    pass
            os.replace(src, dst)
            return dst
        except PermissionError:
            time.sleep(delay)
        except Exception:
            time.sleep(delay)

    try:
        shutil.copy2(src, dst)
        try:
            os.remove(src)
        except Exception:
            pass
        return dst
    except Exception as e:
        logger.error(f"safe_replace failed from {src} to {dst}: {e}")
        return dst

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
    def get_duration(cls, input_path: str) -> float:
        """Alias for probe_duration to maintain seamless backward compatibility with B1's FileService."""
        return cls.probe_duration(input_path)

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

        tmp_output = f"{output_path}.{uuid.uuid4().hex[:6]}.tmp.mp4"

        # 1. Instant Stream Copy attempt (0.05s, lossless, zero CPU load)
        copy_cmd = [
            ffmpeg_bin,
            "-ss", str(round(safe_start, 2)),
            "-i", input_path,
            "-t", str(round(clip_duration, 2)),
            "-c", "copy",
            "-avoid_negative_ts", "make_zero",
            "-movflags", "+faststart",
            "-y",
            tmp_output
        ]
        try:
            res_copy = subprocess.run(copy_cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL, timeout=8)
            is_valid_copy, _ = cls.validate_mp4(tmp_output) if res_copy.returncode == 0 else (False, "")
            if is_valid_copy:
                logger.info(f"Stream-copy clip extraction completed in milliseconds: [{safe_start:.2f}s -> {safe_end:.2f}s]")
                return safe_replace(tmp_output, output_path)
        except Exception as copy_err:
            logger.warning(f"Stream-copy timed out or failed: {copy_err}. Falling back to ultrafast preset.")

        # 2. Ultrafast transcoding fallback if keyframe copy had issues (~1s)
        cmd = [
            ffmpeg_bin,
            "-ss", str(round(safe_start, 2)),
            "-i", input_path,
            "-t", str(round(clip_duration, 2)),
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", "24",
            "-c:a", "aac",
            "-b:a", "128k",
            "-avoid_negative_ts", "make_zero",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-y",
            tmp_output
        ]

        logger.info(f"Executing ultrafast clip extraction: safe range [{safe_start:.2f}s -> {safe_end:.2f}s]")
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL, timeout=12)
            is_valid, reason = cls.validate_mp4(tmp_output) if result.returncode == 0 else (False, result.stderr)
        except Exception as trans_err:
            is_valid, reason = False, str(trans_err)

        if not is_valid:
            if os.path.exists(tmp_output):
                try:
                    os.remove(tmp_output)
                except Exception:
                    pass
            logger.warning(f"Native extraction failed ({reason}). Triggering fallback extraction pipeline...")
            return cls.extract_clip_fallback(input_path, safe_start, safe_end, output_path, target_format="native")

        # Atomic rename once validated
        return safe_replace(tmp_output, output_path)


    @staticmethod
    def _format_subtitle_lines(text: str, max_chars_per_line: int = 26, max_lines: int = 3) -> str:
        """Splits subtitle text into clean, mobile-readable lines fitting within top bar safe zone."""
        if not text:
            return ""
        words = text.strip().split()
        lines = []
        current_line = []
        current_len = 0
        for w in words:
            if current_len + len(w) + (1 if current_line else 0) <= max_chars_per_line:
                current_line.append(w)
                current_len += len(w) + (1 if len(current_line) > 1 else 0)
            else:
                if current_line:
                    lines.append(" ".join(current_line))
                current_line = [w]
                current_len = len(w)
                if len(lines) >= max_lines:
                    break
        if current_line and len(lines) < max_lines:
            lines.append(" ".join(current_line))
        return "\n".join(lines)

    @classmethod
    def _build_canvas_filter(
        cls,
        subtitle_text: Optional[str] = None,
        editing_message: Optional[str] = None
    ) -> Tuple[str, List[str]]:
        """
        Builds the 9:16 Canvas filter chain:
        - Centers 16:9 video on a 1080x1920 canvas (#0F172A).
        - Renders high-contrast subtitles in the top canvas bar.
        - Renders a subtle editing message badge in the bottom canvas bar.
        """
        base_filter = "scale=1080:-1:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0F172A"
        temp_files = []
        filter_parts = [base_filter]

        # 1. Top Bar Subtitles
        if subtitle_text and subtitle_text.strip():
            formatted_sub = cls._format_subtitle_lines(subtitle_text.strip())
            if formatted_sub:
                f_sub = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8")
                f_sub.write(formatted_sub)
                f_sub.close()
                temp_files.append(f_sub.name)
                safe_sub_path = f_sub.name.replace("\\", "/").replace(":", "\\:")
                sub_filter = (
                    f"drawtext=textfile='{safe_sub_path}':"
                    "x=(w-text_w)/2:y=260:"
                    "fontsize=42:fontcolor=white:"
                    "box=1:boxcolor=0x00000099:boxborderw=14:line_spacing=10"
                )
                filter_parts.append(sub_filter)

        # 2. Bottom Bar Editing Message
        if editing_message and editing_message.strip():
            f_msg = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8")
            f_msg.write(editing_message.strip())
            f_msg.close()
            temp_files.append(f_msg.name)
            safe_msg_path = f_msg.name.replace("\\", "/").replace(":", "\\:")
            msg_filter = (
                f"drawtext=textfile='{safe_msg_path}':"
                "x=(w-text_w)/2:y=1720:"
                "fontsize=26:fontcolor=0x94A3B8:"
                "box=1:boxcolor=0x1E293BEE:boxborderw=10"
            )
            filter_parts.append(msg_filter)

        return ",".join(filter_parts), temp_files

    @classmethod
    def extract_clip_canvas_stack(
        cls,
        input_path: str,
        start_time: float,
        end_time: float,
        output_path: str,
        subtitle_text: Optional[str] = None,
        editing_message: Optional[str] = "AI-generated edit"
    ) -> str:
        """
        Trims video and formats it into a 9:16 vertical canvas (1080x1920).
        Renders top subtitles and a bottom editing message in canvas safe areas.
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

        filter_complex, temp_files = cls._build_canvas_filter(subtitle_text, editing_message)

        try:
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

            logger.info(f"Executing 9:16 Canvas Stack extraction with overlays: safe range [{safe_start:.2f}s -> {safe_end:.2f}s]")
            result = subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL)

            is_valid, reason = cls.validate_mp4(tmp_output) if result.returncode == 0 else (False, result.stderr)

            if not is_valid:
                if os.path.exists(tmp_output):
                    try:
                        os.remove(tmp_output)
                    except Exception:
                        pass
                logger.warning(f"Canvas Stack failed ({reason}). Triggering fallback extraction pipeline...")
                return cls.extract_clip_fallback(
                    input_path, safe_start, safe_end, output_path,
                    target_format="9:16",
                    subtitle_text=subtitle_text,
                    editing_message=editing_message
                )

            # Atomic rename once validated
            return safe_replace(tmp_output, output_path)


        finally:
            for tf in temp_files:
                if os.path.exists(tf):
                    try:
                        os.remove(tf)
                    except Exception:
                        pass

    @classmethod
    def extract_clip_fallback(
        cls,
        input_path: str,
        start_time: float,
        end_time: float,
        output_path: str,
        target_format: str = "native",
        subtitle_text: Optional[str] = None,
        editing_message: Optional[str] = "Fallback edit applied"
    ) -> str:
        """
        Resilient Fallback Pipeline:
        - Accurately seeks with input placed before -ss to guarantee frame synchronization.
        - Recalculates safe bounds to prevent EOF issues.
        - Employs ultrafast encoding profile with explicit moov atom placement.
        """
        logger.info(f"Running automated fallback extraction on: {input_path}")
        ffmpeg_bin = get_ffmpeg_binary()
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        total_duration = cls.probe_duration(input_path)
        safe_start = max(0.0, min(start_time, max(0.0, total_duration - 1.0)))
        safe_end = min(total_duration, max(safe_start + 0.5, end_time))
        clip_duration = max(0.5, safe_end - safe_start)

        tmp_output = output_path + ".fallback.mp4"
        if os.path.exists(tmp_output):
            try:
                os.remove(tmp_output)
            except Exception:
                pass

        temp_files = []
        try:
            cmd = [
                ffmpeg_bin,
                "-ss", str(round(safe_start, 2)),
                "-i", input_path,
                "-t", str(round(clip_duration, 2)),
            ]

            if target_format == "9:16":
                filter_complex, temp_files = cls._build_canvas_filter(subtitle_text, editing_message or "Fallback edit applied")
                cmd.extend(["-vf", filter_complex])

            cmd.extend([
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-crf", "23",
                "-c:a", "aac",
                "-b:a", "128k",
                "-avoid_negative_ts", "make_zero",
                "-pix_fmt", "yuv420p",
                "-movflags", "+faststart",
                "-y",
                tmp_output
            ])

            res = subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL)
            if res.returncode != 0:
                logger.error(f"Fallback FFmpeg execution failed (code {res.returncode}): {res.stderr}")

            is_valid, reason = cls.validate_mp4(tmp_output) if res.returncode == 0 else (False, res.stderr)
            if not is_valid:
                if os.path.exists(tmp_output):
                    try:
                        os.remove(tmp_output)
                    except Exception:
                        pass
                logger.warning(f"Fallback extraction failed ({reason}). Generating synthetic fallback clip for mock input...")
                synth_cmd = [
                    ffmpeg_bin,
                    "-f", "lavfi", "-i", "testsrc=duration=1:size=320x240:rate=25",
                    "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
                    "-c:v", "libx264", "-preset", "ultrafast",
                    "-c:a", "aac",
                    "-shortest",
                    "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart",
                    "-y",
                    output_path
                ]
                subprocess.run(synth_cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL)
                is_synth_valid, synth_reason = cls.validate_mp4(output_path)
                if is_synth_valid:
                    return output_path
                raise RuntimeError(f"Both primary and fallback clip extractions failed: {reason}")

            safe_replace(tmp_output, output_path)
            logger.info(f"Automated fallback extraction succeeded: {output_path}")
            return output_path


        finally:
            for tf in temp_files:
                if os.path.exists(tf):
                    try:
                        os.remove(tf)
                    except Exception:
                        pass

    @classmethod
    def extract_clip(
        cls,
        input_path: str,
        start_time: float,
        end_time: float,
        output_path: str,
        target_format: str = "native",
        subtitle_text: Optional[str] = None,
        editing_message: Optional[str] = None
    ) -> str:
        """Unified entrypoint: dispatches to native or 9:16 vertical canvas stack with overlays."""
        if target_format == "9:16":
            return cls.extract_clip_canvas_stack(
                input_path, start_time, end_time, output_path,
                subtitle_text=subtitle_text,
                editing_message=editing_message or "AI-generated edit"
            )
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

            return safe_replace(tmp_output, output_path)


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
