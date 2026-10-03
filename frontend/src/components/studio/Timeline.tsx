import React, { useRef, useState } from 'react';
import { Clip } from '../../types/project';
import { formatSecondsToTime } from '../../utils/timeFormatter';
import { TimelineItem } from './TimelineItem';

interface TimelineProps {
  /** Clips in the creator's current sequence order. */
  clips: Clip[];
  selectedId?: string;
  sourceDuration: number;
  currentTime: number;
  onSelectClip: (clip: Clip) => void;
  onSeek: (time: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const pad = (n: number) => n.toString().padStart(2, '0');

const tickStep = (duration: number) => (duration <= 120 ? 10 : duration <= 600 ? 60 : 300);

/**
 * Two-tier timeline:
 *  1. Source track — where each AI moment lives inside the raw footage (click to seek).
 *  2. Your cut — the reorderable short-form sequence.
 */
export const Timeline: React.FC<TimelineProps> = ({
  clips,
  selectedId,
  sourceDuration,
  currentTime,
  onSelectClip,
  onSeek,
  onReorder,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const pct = (t: number) => `${(Math.min(t, sourceDuration) / sourceDuration) * 100}%`;
  const step = tickStep(sourceDuration);
  const ticks = Array.from({ length: Math.floor(sourceDuration / step) + 1 }, (_, i) => i * step);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    onSeek(((e.clientX - rect.left) / rect.width) * sourceDuration);
  };

  const sequenceSeconds = Math.round(clips.reduce((s, c) => s + (c.end_time - c.start_time), 0));

  return (
    <section className="py-16 border-t st-hairline">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="st-eyebrow">Timeline</p>
          <h2 className="st-display text-[40px] md:text-[52px] mt-3">Where the moments live.</h2>
        </div>
        <p className="hidden md:block text-[14px] text-[var(--st-muted)] max-w-[32ch] text-right">
          Click a moment to jump to it. Drag blocks below to change the order of your cut.
        </p>
      </div>

      {/* --- Source track --- */}
      <div className="flex items-center justify-between mb-3">
        <span className="st-eyebrow !text-[10px]">Source footage</span>
        <span className="st-mono text-[11px] text-[var(--st-muted)]">{formatSecondsToTime(sourceDuration)}</span>
      </div>

      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative h-[72px] rounded-[18px] bg-[var(--st-surface)] border st-hairline cursor-crosshair overflow-hidden"
      >
        {/* waveform-ish texture so the raw footage reads as "media", not a bar */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 opacity-[0.18]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 6px)',
            maskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)',
          }}
        />

        {clips.map((clip, i) => {
          const selected = clip.id === selectedId;
          return (
            <button
              key={clip.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectClip(clip);
              }}
              className={`absolute top-2 bottom-2 rounded-[12px] border text-left px-3 transition-colors duration-500 ${
                selected
                  ? 'bg-[#ff5a36]/90 border-[#ff5a36] text-[var(--st-ink)]'
                  : 'bg-white/[0.08] border-white/15 text-[var(--st-text)] hover:bg-white/[0.14]'
              }`}
              style={{ left: pct(clip.start_time), width: `calc(${pct(clip.end_time - clip.start_time)} - 2px)` }}
              title={clip.title}
            >
              <span className="st-mono text-[11px] font-medium">{pad(i + 1)}</span>
            </button>
          );
        })}

        {/* Playhead */}
        <span
          className="absolute top-0 bottom-0 w-px bg-[var(--st-text)] pointer-events-none transition-[left] duration-200 ease-linear"
          style={{ left: pct(currentTime) }}
        >
          <span className="absolute -top-px -left-[4px] w-[9px] h-[9px] rounded-full bg-[var(--st-text)]" />
        </span>
      </div>

      <div className="relative h-6 mt-2">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute st-mono text-[10px] text-[var(--st-faint)] -translate-x-1/2 first:translate-x-0"
            style={{ left: pct(t) }}
          >
            {formatSecondsToTime(t)}
          </span>
        ))}
      </div>

      {/* --- Reorderable sequence --- */}
      <div className="flex items-center justify-between mt-10 mb-3">
        <span className="st-eyebrow !text-[10px]">Your cut · {clips.length} clips</span>
        <span className="st-mono text-[11px] text-[var(--st-muted)]">{sequenceSeconds}s total</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2" onDragOver={(e) => e.preventDefault()}>
        {clips.map((clip, i) => {
          const inRange = currentTime >= clip.start_time && currentTime < clip.end_time;
          return (
            <TimelineItem
              key={clip.id}
              clip={clip}
              index={i + 1}
              total={clips.length}
              isSelected={clip.id === selectedId}
              isDragging={clip.id === dragId}
              progress={inRange ? (currentTime - clip.start_time) / (clip.end_time - clip.start_time) : null}
              onSelect={() => onSelectClip(clip)}
              onMove={(delta) => onReorder(i, i + delta)}
              onDragStart={() => setDragId(clip.id)}
              onDragEnter={() => {
                if (!dragId || dragId === clip.id) return;
                const from = clips.findIndex((c) => c.id === dragId);
                if (from !== -1) onReorder(from, i);
              }}
              onDragEnd={() => setDragId(null)}
            />
          );
        })}
      </div>
    </section>
  );
};
