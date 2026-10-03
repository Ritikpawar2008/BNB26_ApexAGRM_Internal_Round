import React from 'react';
import { Clip } from '../../types/project';
import { formatSecondsToTime } from '../../utils/timeFormatter';

interface ExportClipListProps {
  clips: Clip[];
  selectedId: string;
  onSelectClip: (clip: Clip) => void;
}

const pad = (n: number) => n.toString().padStart(2, '0');

export const ExportClipList: React.FC<ExportClipListProps> = ({
  clips,
  selectedId,
  onSelectClip,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="st-eyebrow">Final Sequence · {clips.length} Clips</label>
        <span className="st-mono text-[11px] text-[var(--st-muted)]">Click clip to preview</span>
      </div>

      <div className="flex flex-col gap-2">
        {clips.map((clip, index) => {
          const isSelected = clip.id === selectedId;
          const duration = Math.round(clip.end_time - clip.start_time);
          return (
            <button
              key={clip.id}
              type="button"
              onClick={() => onSelectClip(clip)}
              className={`p-4 rounded-[18px] border text-left transition-all duration-300 flex items-center justify-between gap-4 ${
                isSelected
                  ? 'border-[var(--st-text)] bg-[var(--st-surface-2)] shadow-md'
                  : 'border-[var(--st-line)] bg-[var(--st-surface)] hover:border-[var(--st-line-strong)]'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span
                  className={`st-mono text-[14px] font-medium shrink-0 ${
                    isSelected ? 'text-[var(--st-accent)]' : 'text-white/40'
                  }`}
                >
                  {pad(index + 1)}
                </span>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-medium text-white truncate">{clip.title}</h4>
                  <p className="text-[12px] text-[var(--st-muted)] truncate max-w-md mt-0.5">
                    “{clip.hook}”
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="st-mono text-[12px] text-white/90 block">
                  {formatSecondsToTime(clip.start_time)} — {formatSecondsToTime(clip.end_time)}
                </span>
                <span className="st-mono text-[11px] text-[var(--st-muted)] block mt-0.5">
                  {duration}s
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
