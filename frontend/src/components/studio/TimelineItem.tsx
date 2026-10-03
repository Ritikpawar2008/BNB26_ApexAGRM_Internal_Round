import React from 'react';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { Clip } from '../../types/project';

interface TimelineItemProps {
  clip: Clip;
  index: number;
  total: number;
  isSelected: boolean;
  isDragging: boolean;
  /** 0..1 playback progress through this clip, or null when the playhead is elsewhere. */
  progress: number | null;
  onSelect: () => void;
  onMove: (delta: -1 | 1) => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}

const pad = (n: number) => n.toString().padStart(2, '0');

/** One block in the creator's reorderable sequence. Width tracks clip length. */
export const TimelineItem: React.FC<TimelineItemProps> = ({
  clip,
  index,
  total,
  isSelected,
  isDragging,
  progress,
  onSelect,
  onMove,
  onDragStart,
  onDragEnter,
  onDragEnd,
}) => {
  const length = clip.end_time - clip.start_time;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', clip.id);
        onDragStart();
      }}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      style={{ flexGrow: length, flexBasis: 0 }}
      className={`group relative min-w-[150px] h-[104px] rounded-[18px] border overflow-hidden transition-[background-color,border-color,opacity,transform] duration-500 cursor-grab active:cursor-grabbing ${
        isSelected
          ? 'border-[var(--st-text)] bg-[var(--st-surface-2)]'
          : 'border-[var(--st-line)] bg-[var(--st-surface)] hover:border-[var(--st-line-strong)]'
      } ${isDragging ? 'opacity-40 scale-[0.98]' : ''}`}
    >
      <button type="button" onClick={onSelect} className="absolute inset-0 text-left p-4 flex flex-col justify-between">
        <span className="flex items-center justify-between">
          <span className={`st-mono text-[11px] ${isSelected ? 'text-[var(--st-accent)]' : 'text-[var(--st-muted)]'}`}>
            {pad(index)}
          </span>
          <GripVertical className="w-3.5 h-3.5 text-[var(--st-faint)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
        <span>
          <span className="block text-[14px] leading-tight truncate pr-2">{clip.title}</span>
          <span className="block st-mono text-[11px] text-[var(--st-muted)] mt-1">{Math.round(length)}s</span>
        </span>
      </button>

      {progress !== null && (
        <span className="absolute left-0 bottom-0 h-[2px] bg-[#ff5a36]" style={{ width: `${progress * 100}%` }} />
      )}

      {isSelected && (
        <span className="absolute right-3 bottom-3 flex gap-1 st-fade">
          <button
            type="button"
            aria-label="Move earlier"
            disabled={index === 1}
            onClick={() => onMove(-1)}
            className="w-7 h-7 rounded-full border border-[var(--st-line-strong)] flex items-center justify-center hover:bg-[var(--st-text)] hover:text-[var(--st-ink)] disabled:opacity-25 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Move later"
            disabled={index === total}
            onClick={() => onMove(1)}
            className="w-7 h-7 rounded-full border border-[var(--st-line-strong)] flex items-center justify-center hover:bg-[var(--st-text)] hover:text-[var(--st-ink)] disabled:opacity-25 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </span>
      )}
    </div>
  );
};
