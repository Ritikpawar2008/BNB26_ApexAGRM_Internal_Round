import React from 'react';
import { Clip } from '../../types/project';
import { formatSecondsToTime } from '../../utils/timeFormatter';

interface ClipCardProps {
  clip: Clip;
  /** 1-based position in the creator's current sequence. */
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

const pad = (n: number) => n.toString().padStart(2, '0');

/** A single AI-recommended moment, presented as an editorial list row. */
export const ClipCard: React.FC<ClipCardProps> = ({ clip, index, isSelected, onSelect, onPreview }) => {
  const length = Math.round(clip.end_time - clip.start_time);

  return (
    <li className="relative">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={`group w-full text-left grid grid-cols-[56px_1fr] gap-x-4 px-5 py-6 rounded-[22px] transition-colors duration-500 ${
          isSelected ? 'bg-[var(--st-surface-2)]' : 'hover:bg-white/[0.025]'
        }`}
      >
        <span
          className={`st-display text-[40px] transition-colors duration-500 ${
            isSelected ? 'text-[var(--st-accent)]' : 'text-[var(--st-faint)] group-hover:text-[var(--st-muted)]'
          }`}
        >
          {pad(index)}
        </span>

        <span className="min-w-0">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] uppercase tracking-[0.08em] font-medium truncate">{clip.title}</span>
            <span className="st-mono text-[11px] text-[var(--st-muted)] shrink-0">{length}s</span>
          </span>
          <span className="block st-mono text-[11px] text-[var(--st-muted)] mt-1.5">
            {formatSecondsToTime(clip.start_time)} — {formatSecondsToTime(clip.end_time)}
          </span>
          <span className="block mt-4 text-[17px] leading-snug tracking-[-0.01em] text-[var(--st-text)]">
            “{clip.hook}”
          </span>
          {clip.reason && (
            <span
              className={`block mt-3 text-[13px] leading-relaxed text-[var(--st-muted)] ${isSelected ? '' : 'line-clamp-1'}`}
            >
              {isSelected && <span className="st-eyebrow mr-2 !text-[10px]">Why</span>}
              {clip.reason}
            </span>
          )}
        </span>
      </button>

      {isSelected && (
        <div className="flex items-center justify-between pl-[96px] pr-5 -mt-2 pb-5 st-fade">
          <span className="st-mono text-[11px] text-[var(--st-muted)]">
            <span className="text-[var(--st-text)]">{Math.round(clip.confidence * 100)}%</span> confidence
          </span>
          <button
            type="button"
            onClick={onPreview}
            className="text-[13px] text-[var(--st-text)] underline underline-offset-4 decoration-[var(--st-accent)] hover:text-[var(--st-accent)] transition-colors"
          >
            Preview clip
          </button>
        </div>
      )}
    </li>
  );
};
