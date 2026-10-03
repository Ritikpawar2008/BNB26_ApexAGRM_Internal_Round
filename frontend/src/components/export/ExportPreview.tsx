import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Heart, MessageCircle, Music, Pause, Play, Share2, Sparkles, Volume2 } from 'lucide-react';
import { Clip } from '../../types/project';
import { formatSecondsToTime } from '../../utils/timeFormatter';
import { AspectFormat } from './FormatSelector';

export interface ExportPreviewHandle {
  seek: (time: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
}

interface ExportPreviewProps {
  clip: Clip;
  index: number;
  format: AspectFormat;
  platform: string;
  sourceUrl?: string;
  onPreviewNext?: () => void;
}

const pad = (n: number) => n.toString().padStart(2, '0');

export const ExportPreview = forwardRef<ExportPreviewHandle, ExportPreviewProps>(
  ({ clip, index, format, platform, sourceUrl }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [failed, setFailed] = useState(false);
    const [hasLoadedNative, setHasLoadedNative] = useState(false);
    const [showGuides, setShowGuides] = useState(true);

    const clipDuration = Math.max(1, clip.end_time - clip.start_time);

    // Simulated playback loop for mock/offline sources
    useEffect(() => {
      if (!isPlaying || hasLoadedNative) return;
      let lastTime = performance.now();
      let frameId: number;

      const tick = (now: number) => {
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= clipDuration) {
            return 0; // Smooth loop for short-form preview
          }
          return next;
        });
        frameId = requestAnimationFrame(tick);
      };

      frameId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frameId);
    }, [isPlaying, hasLoadedNative, clipDuration]);

    // Reset playback position when selected clip changes
    useEffect(() => {
      setCurrentTime(0);
      setIsPlaying(false);
      if (videoRef.current && hasLoadedNative) {
        videoRef.current.currentTime = clip.start_time;
      }
    }, [clip.id, clip.start_time, hasLoadedNative]);

    const play = useCallback(() => {
      const video = videoRef.current;
      if (video && !failed) {
        video
          .play()
          .then(() => {
            setHasLoadedNative(true);
            setIsPlaying(true);
          })
          .catch(() => {
            setFailed(true);
            setHasLoadedNative(false);
            setIsPlaying(true);
          });
      } else {
        setIsPlaying(true);
      }
    }, [failed]);

    const pause = useCallback(() => {
      videoRef.current?.pause();
      setIsPlaying(false);
    }, []);

    const toggle = useCallback(() => {
      setIsPlaying((prev) => {
        if (prev) {
          videoRef.current?.pause();
          return false;
        } else {
          const video = videoRef.current;
          if (video && !failed) {
            video.play().catch(() => setFailed(true));
          }
          return true;
        }
      });
    }, [failed]);

    const seek = useCallback(
      (time: number) => {
        const clamped = Math.max(0, Math.min(time, clipDuration));
        setCurrentTime(clamped);
        if (videoRef.current && hasLoadedNative) {
          videoRef.current.currentTime = clip.start_time + clamped;
        }
      },
      [clipDuration, clip.start_time, hasLoadedNative]
    );

    useImperativeHandle(ref, () => ({ seek, play, pause, toggle }), [seek, play, pause, toggle]);

    const progress = clipDuration > 0 ? Math.min(1, currentTime / clipDuration) : 0;

    // Aspect ratio container sizing
    const frameClass =
      format === '9:16'
        ? 'aspect-[9/16] w-full max-w-[340px] md:max-w-[380px] rounded-[32px]'
        : format === '1:1'
        ? 'aspect-square w-full max-w-[460px] rounded-[28px]'
        : 'aspect-video w-full max-w-[680px] rounded-[28px]';

    return (
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Visual Frame */}
        <div
          onClick={toggle}
          className={`${frameClass} mx-auto relative overflow-hidden bg-slate-950 border border-white/15 shadow-2xl transition-all duration-500 cursor-pointer group select-none`}
        >
          {/* Native video element */}
          {!failed && (
            <video
              ref={videoRef}
              src={clip.url || sourceUrl}
              playsInline
              preload="metadata"
              className={`w-full h-full object-cover ${hasLoadedNative ? 'opacity-100' : 'opacity-0 absolute'}`}
              onLoadedMetadata={() => setHasLoadedNative(true)}
              onTimeUpdate={(e) => {
                if (hasLoadedNative) {
                  const currentInClip = e.currentTarget.currentTime - clip.start_time;
                  setCurrentTime(Math.max(0, currentInClip));
                  if (e.currentTarget.currentTime >= clip.end_time) {
                    pause();
                    seek(0);
                  }
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                setFailed(true);
                setHasLoadedNative(false);
              }}
            />
          )}

          {/* AI Video Simulation Canvas (always active if native video is offline/mocked) */}
          {(!hasLoadedNative || failed) && (
            <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-br from-slate-950 via-[#0d121f] to-[#161220]">
              {/* Subtle ambient light */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(255, 90, 54, 0.3) 0%, transparent 65%)',
                }}
              />

              {/* Top HUD status */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[10px] st-mono text-white/90">
                  <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-red-500/50'}`} />
                  <span>EXPORT PREVIEW</span>
                  <span className="text-white/40">|</span>
                  <span>{format}</span>
                </div>
                <div className="text-[10px] st-mono text-white/60 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  Clip {pad(index)}
                </div>
              </div>

              {/* Center Content Mock Presentation */}
              <div className="relative z-10 my-auto text-center px-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-[11px] st-mono mb-3">
                  <Sparkles className="w-3 h-3 text-[var(--st-accent)]" />
                  <span>{clip.title}</span>
                </div>

                {/* Animated spectrum waves */}
                <div className="flex items-center justify-center gap-1.5 h-12 mt-4">
                  {Array.from({ length: format === '9:16' ? 14 : 24 }).map((_, i) => {
                    const heights = isPlaying
                      ? [30, 70, 95, 45, 85, 60, 40, 90, 65, 35, 75, 50, 80, 40]
                      : [20, 25, 30, 20, 35, 25, 20, 30, 25, 20, 15, 25, 30, 20];
                    const height = heights[i % heights.length];
                    return (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-gradient-to-t from-[var(--st-accent)] to-white transition-all duration-150"
                        style={{
                          height: isPlaying
                            ? `${Math.max(15, height * (0.6 + Math.sin(currentTime * 8 + i) * 0.4))}%`
                            : `${height * 0.3}%`,
                          opacity: isPlaying ? 0.9 : 0.25,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Bottom audio watermark */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-white/50 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  <span className="st-mono">Stitched & Leveled Audio</span>
                </div>
                <span className="st-mono">{formatSecondsToTime(currentTime)}</span>
              </div>
            </div>
          )}

          {/* Hook Typography Overlay */}
          <div
            className={`absolute inset-x-0 z-20 pointer-events-none p-6 ${
              format === '9:16'
                ? 'top-10 bg-gradient-to-b from-black/85 via-black/40 to-transparent'
                : 'bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent'
            }`}
          >
            <span className="st-eyebrow !text-white/80 !text-[10px] block mb-1">
              Verbal Hook
            </span>
            <p
              className={`font-semibold tracking-tight text-white drop-shadow-lg ${
                format === '9:16' ? 'text-[18px] leading-snug' : 'text-[22px] leading-tight max-w-md'
              }`}
            >
              “{clip.hook}”
            </p>
          </div>

          {/* Vertical 9:16 Platform Overlay Mockup (Safe zones guide) */}
          {format === '9:16' && showGuides && (
            <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-5 pt-8">
              {/* Platform watermark badge */}
              <div className="self-end px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-[10px] text-white/70 st-mono border border-white/10">
                {platform === 'tiktok' ? 'TikTok FYP Safe Zones' : platform === 'youtube_shorts' ? 'Shorts Safe Zones' : 'Reels Safe Zones'}
              </div>

              {/* Right Side Social Engagement Icons */}
              <div className="self-end flex flex-col items-center gap-4 mb-20 text-white/90">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] st-mono">84.2K</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] st-mono">1.4K</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] st-mono">Share</span>
                </div>
              </div>

              {/* Bottom Caption & Audio ticker */}
              <div className="bg-gradient-to-t from-black/95 via-black/60 to-transparent -mx-5 -mb-5 p-5 pt-6">
                <p className="text-[12px] font-semibold text-white">@creator.ai</p>
                <p className="text-[11px] text-white/80 line-clamp-2 mt-1 leading-snug font-normal">
                  {clip.caption}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-white/60 st-mono">
                  <Music className="w-3 h-3 text-[var(--st-accent)]" />
                  <span className="truncate">Original Audio · CreatorAI Master Track</span>
                </div>
              </div>
            </div>
          )}

          {/* Center Play Button Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  play();
                }}
                aria-label="Play clip"
                className="pointer-events-auto w-18 h-18 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-2xl p-5"
              >
                <Play className="w-7 h-7 ml-1" fill="currentColor" />
              </button>
            </div>
          )}
        </div>

        {/* Transport & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-[680px]">
          <div className="flex items-center gap-4 flex-1">
            <button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 shrink-0 rounded-full border border-[var(--st-line-strong)] flex items-center justify-center hover:bg-[var(--st-text)] hover:text-[var(--st-ink)] transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
            </button>

            <span className="st-mono text-[12px] text-[var(--st-muted)] shrink-0 w-[88px]">
              <span className="text-[var(--st-text)]">{formatSecondsToTime(currentTime)}</span> / {formatSecondsToTime(clipDuration)}
            </span>

            {/* Scrub bar */}
            <div
              className="st-scrub flex-1"
              role="slider"
              aria-label="Seek preview"
              aria-valuemin={0}
              aria-valuemax={Math.round(clipDuration)}
              aria-valuenow={Math.round(currentTime)}
              tabIndex={0}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                seek(ratio * clipDuration);
              }}
            >
              <div className="st-scrub__track overflow-hidden">
                <span className="absolute inset-y-0 left-0 bg-[var(--st-accent)]" style={{ width: `${progress * 100}%` }} />
              </div>
              <span
                className="absolute top-1/2 w-3 h-3 -mt-1.5 -ml-1.5 rounded-full bg-white shadow"
                style={{ left: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Safe-zone overlays toggle for 9:16 */}
          {format === '9:16' && (
            <button
              type="button"
              onClick={() => setShowGuides((prev) => !prev)}
              className="st-mono text-[11px] px-3 py-1.5 rounded-full border border-[var(--st-line-strong)] text-[var(--st-muted)] hover:text-white transition-colors"
            >
              {showGuides ? 'Hide Platform UI' : 'Show Platform UI'}
            </button>
          )}
        </div>
      </div>
    );
  }
);

ExportPreview.displayName = 'ExportPreview';
