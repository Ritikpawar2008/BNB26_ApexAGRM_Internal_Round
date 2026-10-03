import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Pause, Play, Sparkles, Video, Volume2 } from 'lucide-react';
import { Clip } from '../../types/project';
import { formatSecondsToTime } from '../../utils/timeFormatter';

export type PreviewFrame = 'source' | 'vertical';

export interface VideoPlayerHandle {
  seek: (time: number) => void;
  play: () => void;
  pause: () => void;
}

interface VideoPlayerProps {
  src?: string;
  sourceDuration: number;
  clips: Clip[];
  selectedClip?: Clip;
  selectedIndex: number;
  currentTime: number;
  isPlaying: boolean;
  frame: PreviewFrame;
  playbackLabel?: string;
  onFrameChange: (frame: PreviewFrame) => void;
  onTimeUpdate: (time: number) => void;
  onPlayingChange: (playing: boolean) => void;
  onPlaySequence: () => void;
}

const pad = (n: number) => n.toString().padStart(2, '0');

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      src,
      sourceDuration,
      clips,
      selectedClip,
      selectedIndex,
      currentTime,
      isPlaying,
      frame,
      playbackLabel,
      onFrameChange,
      onTimeUpdate,
      onPlayingChange,
      onPlaySequence,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const pendingSeek = useRef<number | null>(null);
    const [failed, setFailed] = useState(false);
    const [hasLoadedNative, setHasLoadedNative] = useState(false);

    // Simulated clock for mock or offline playback
    useEffect(() => {
      if (!isPlaying || hasLoadedNative) return;
      let lastTime = performance.now();
      let frameId: number;

      const tick = (now: number) => {
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        onTimeUpdate(Math.min(sourceDuration, currentTime + delta));
        frameId = requestAnimationFrame(tick);
      };

      frameId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frameId);
    }, [isPlaying, hasLoadedNative, currentTime, sourceDuration, onTimeUpdate]);

    const seek = useCallback(
      (time: number) => {
        const t = Math.max(0, Math.min(time, sourceDuration));
        const video = videoRef.current;
        if (video && hasLoadedNative && video.readyState >= 1) {
          video.currentTime = t;
        } else {
          pendingSeek.current = t;
        }
        onTimeUpdate(t);
      },
      [sourceDuration, onTimeUpdate, hasLoadedNative]
    );

    const play = useCallback(() => {
      const video = videoRef.current;
      if (video && !failed) {
        video.play().then(() => {
          setHasLoadedNative(true);
          onPlayingChange(true);
        }).catch(() => {
          // If native video fails or is blocked, switch to fallback animation
          setFailed(true);
          setHasLoadedNative(false);
          onPlayingChange(true);
        });
      } else {
        onPlayingChange(true);
      }
    }, [failed, onPlayingChange]);

    const pause = useCallback(() => {
      videoRef.current?.pause();
      onPlayingChange(false);
    }, [onPlayingChange]);

    useImperativeHandle(ref, () => ({ seek, play, pause }), [seek, play, pause]);

    const toggle = () => (isPlaying ? pause() : play());

    // Scrubber interaction
    const scrubRef = useRef<HTMLDivElement>(null);
    const seekFromPointer = (clientX: number) => {
      const el = scrubRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      seek(ratio * sourceDuration);
    };

    const progress = sourceDuration > 0 ? Math.min(1, currentTime / sourceDuration) : 0;
    const activeClip = clips.find((c) => currentTime >= c.start_time && currentTime < c.end_time);
    const overlayClip = frame === 'vertical' ? activeClip ?? selectedClip : activeClip ?? selectedClip;
    const overlayIndex = overlayClip ? clips.findIndex((c) => c.id === overlayClip.id) + 1 : selectedIndex;

    return (
      <div className="flex flex-col gap-5">
        {/* Main Stage */}
        <div className="st-surface relative aspect-video overflow-hidden bg-black select-none">
          {/* Vertical mode side meta */}
          {frame === 'vertical' && selectedClip && (
            <div className="absolute left-8 top-8 bottom-8 hidden lg:flex flex-col justify-between max-w-[28%] st-fade pointer-events-none z-10">
              <div>
                <p className="st-eyebrow flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--st-accent)]" />
                  Short preview · 9:16
                </p>
                <p className="st-display text-[84px] mt-2 text-[var(--st-text)]">{pad(selectedIndex)}</p>
              </div>
              <div>
                <p className="text-[17px] font-medium leading-snug">{selectedClip.title}</p>
                <p className="st-mono text-[12px] text-[var(--st-muted)] mt-2">
                  {formatSecondsToTime(selectedClip.start_time)} — {formatSecondsToTime(selectedClip.end_time)}
                </p>
              </div>
            </div>
          )}

          {/* Video Container (16:9 full or 9:16 centered phone crop) */}
          <div
            onClick={toggle}
            className={`cursor-pointer transition-all duration-500 ${
              frame === 'vertical'
                ? 'absolute top-0 bottom-0 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[10%] lg:translate-x-0 aspect-[9/16] overflow-hidden rounded-[24px] ring-1 ring-white/15 shadow-2xl bg-slate-950'
                : 'absolute inset-0 w-full h-full bg-slate-950'
            }`}
          >
            {/* Native HTML5 video */}
            {!failed && (
              <video
                ref={videoRef}
                src={src}
                playsInline
                preload="metadata"
                className={`w-full h-full object-cover ${hasLoadedNative ? 'opacity-100' : 'opacity-0 absolute'}`}
                onLoadedMetadata={() => {
                  setHasLoadedNative(true);
                  if (pendingSeek.current !== null && videoRef.current) {
                    videoRef.current.currentTime = pendingSeek.current;
                    pendingSeek.current = null;
                  }
                }}
                onTimeUpdate={(e) => {
                  if (hasLoadedNative) onTimeUpdate(e.currentTarget.currentTime);
                }}
                onPlay={() => onPlayingChange(true)}
                onPause={() => onPlayingChange(false)}
                onEnded={() => onPlayingChange(false)}
                onError={() => {
                  setFailed(true);
                  setHasLoadedNative(false);
                }}
              />
            )}

            {/* AI Video Simulation Canvas (always active if native video is offline/mocked) */}
            {(!hasLoadedNative || failed) && (
              <div className="absolute inset-0 flex flex-col justify-between p-6 overflow-hidden bg-gradient-to-br from-slate-950 via-[#0e1320] to-[#14121e]">
                {/* Visual grid texture & animated ambient glow */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 90, 54, 0.25) 0%, transparent 60%)',
                  }}
                />

                {/* Top Video HUD Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] st-mono text-white/90">
                    <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-red-500/50'}`} />
                    <span>REC</span>
                    <span className="text-white/40">|</span>
                    <span>00:{formatSecondsToTime(currentTime)}:{(Math.floor((currentTime % 1) * 30)).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] st-mono text-white/60 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    <span>4K UHD</span>
                    <span>·</span>
                    <span>60 FPS</span>
                  </div>
                </div>

                {/* Center Visual Mock Presentation Screen */}
                <div className="relative z-10 my-auto text-center px-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] st-mono mb-3">
                    <Video className="w-3 h-3" />
                    <span>Source Footage Analysis</span>
                  </div>
                  <h3 className="text-lg md:text-2xl font-light text-white tracking-tight max-w-md mx-auto line-clamp-2">
                    {overlayClip?.title || 'Explaining AI Transformers'}
                  </h3>
                  <p className="text-xs text-white/50 mt-1 st-mono">
                    Segment: {formatSecondsToTime(overlayClip?.start_time ?? 0)} — {formatSecondsToTime(overlayClip?.end_time ?? sourceDuration)}
                  </p>

                  {/* Animated Audio Spectrum Waves */}
                  <div className="flex items-center justify-center gap-1.5 h-12 mt-6">
                    {Array.from({ length: frame === 'vertical' ? 12 : 24 }).map((_, i) => {
                      const heights = isPlaying
                        ? [20, 48, 80, 35, 95, 60, 40, 75, 90, 50, 30, 65, 85, 45, 70, 55, 90, 35, 60, 40, 80, 50, 30, 20]
                        : [15, 25, 30, 20, 35, 25, 20, 30, 25, 20, 15, 25, 30, 20, 35, 25, 20, 30, 25, 20, 15, 20, 15, 10];
                      const height = heights[i % heights.length];
                      return (
                        <div
                          key={i}
                          className="w-1 rounded-full bg-gradient-to-t from-[var(--st-accent)] to-white/70 transition-all duration-150"
                          style={{
                            height: isPlaying ? `${Math.max(12, (height * (0.6 + (Math.sin(currentTime * 8 + i) * 0.4))))}%` : `${height * 0.3}%`,
                            opacity: isPlaying ? 0.9 : 0.25,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Speaker / AI Tracking Meta */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-white/60 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="st-mono text-[10px]">Gemini Speech Sync</span>
                  </div>
                  <div className="st-mono text-[10px] text-white/40">
                    Confidence: {Math.round((overlayClip?.confidence ?? 0.9) * 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* Hook Text Live Video Overlay */}
            {overlayClip && (
              <div
                key={overlayClip.id}
                className={`absolute inset-x-0 pointer-events-none st-fade z-20 ${
                  frame === 'vertical'
                    ? 'top-14 p-5 pt-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent'
                    : 'bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="st-eyebrow !text-white/80 !text-[10px]">Clip {pad(overlayIndex)} Hook</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--st-accent)]" />
                </div>
                <p
                  className={`font-semibold tracking-tight text-white drop-shadow-md ${
                    frame === 'vertical' ? 'text-[18px] leading-snug' : 'text-[24px] leading-tight max-w-[28ch]'
                  }`}
                >
                  “{overlayClip.hook || 'Write a hook…'}”
                </p>
              </div>
            )}

            {/* Vertical Mode Caption Preview at bottom */}
            {frame === 'vertical' && overlayClip?.caption && (
              <div className="absolute bottom-0 inset-x-0 p-4 pb-5 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-20">
                <p className="text-[11px] leading-snug text-white/85 line-clamp-3 font-normal">
                  {overlayClip.caption}
                </p>
              </div>
            )}

            {/* Center Play Button (interactive in both native and simulated mode) */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    play();
                  }}
                  aria-label="Play"
                  className="pointer-events-auto w-20 h-20 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-2xl"
                >
                  <Play className="w-7 h-7 ml-1" fill="currentColor" />
                </button>
              </div>
            )}
          </div>

          {/* Active Sequence or Clip Preview Label */}
          {playbackLabel && (
            <span className="absolute top-6 right-6 st-eyebrow !text-white bg-black/60 backdrop-blur px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/10 z-30">
              <span className="w-2 h-2 rounded-full bg-[var(--st-accent)] animate-ping" />
              {playbackLabel}
            </span>
          )}
        </div>

        {/* Transport Controls Bar */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-11 h-11 shrink-0 rounded-full border border-[var(--st-line-strong)] flex items-center justify-center hover:bg-[var(--st-text)] hover:text-[var(--st-ink)] transition-colors duration-300"
          >
            {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
          </button>

          <span className="st-mono text-[12px] text-[var(--st-muted)] shrink-0 w-[100px]">
            <span className="text-[var(--st-text)]">{formatSecondsToTime(currentTime)}</span> / {formatSecondsToTime(sourceDuration)}
          </span>

          {/* Seek / Scrubber Slider */}
          <div
            ref={scrubRef}
            className="st-scrub flex-1"
            role="slider"
            aria-label="Seek video"
            aria-valuemin={0}
            aria-valuemax={Math.round(sourceDuration)}
            aria-valuenow={Math.round(currentTime)}
            tabIndex={0}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              seekFromPointer(e.clientX);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) seekFromPointer(e.clientX);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') seek(currentTime + 5);
              if (e.key === 'ArrowLeft') seek(currentTime - 5);
            }}
          >
            <div className="st-scrub__track overflow-hidden">
              {clips.map((c) => (
                <span
                  key={c.id}
                  className={`absolute inset-y-0 ${c.id === selectedClip?.id ? 'bg-[#ff5a36]/70' : 'bg-white/25'}`}
                  style={{
                    left: `${(c.start_time / sourceDuration) * 100}%`,
                    width: `${((c.end_time - c.start_time) / sourceDuration) * 100}%`,
                  }}
                />
              ))}
              <span className="absolute inset-y-0 left-0 bg-white/80" style={{ width: `${progress * 100}%` }} />
            </div>
            <span
              className="absolute top-1/2 w-3 h-3 -mt-1.5 -ml-1.5 rounded-full bg-white shadow"
              style={{ left: `${progress * 100}%` }}
            />
          </div>

          {/* 16:9 vs 9:16 Aspect Ratio Switcher */}
          <div className="hidden sm:flex items-center rounded-full border border-[var(--st-line-strong)] p-1 shrink-0">
            {(['source', 'vertical'] as PreviewFrame[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFrameChange(f)}
                className={`px-3.5 h-8 rounded-full text-[12px] st-mono transition-colors duration-300 ${
                  frame === f ? 'bg-[var(--st-text)] text-[var(--st-ink)] font-medium' : 'text-[var(--st-muted)] hover:text-[var(--st-text)]'
                }`}
              >
                {f === 'source' ? '16:9' : '9:16'}
              </button>
            ))}
          </div>

          {/* Preview Sequence Action */}
          <button
            type="button"
            onClick={onPlaySequence}
            className="hidden md:inline text-[13px] text-[var(--st-muted)] hover:text-[var(--st-text)] underline underline-offset-4 decoration-[var(--st-line-strong)] hover:decoration-[var(--st-accent)] transition-colors shrink-0"
          >
            Preview sequence
          </button>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
