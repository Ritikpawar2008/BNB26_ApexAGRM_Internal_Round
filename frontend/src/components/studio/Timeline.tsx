import React from 'react';
import { Clip } from '../../types/project';
import { Badge } from '../common/Badge';
import { ArrowLeft, ArrowRight, CheckSquare, Square, Scissors } from 'lucide-react';

interface TimelineProps {
  clips: Clip[];
  selectedId: string;
  onSelectClip: (id: string) => void;
  onUpdateClipTime: (id: string, start: number, end: number) => void;
  onToggleSelect: (id: string) => void;
  onMovePosition: (id: string, direction: 'earlier' | 'later') => void;
  currentRole: 'editor' | 'client';
}

export const Timeline: React.FC<TimelineProps> = ({
  clips,
  selectedId,
  onSelectClip,
  onUpdateClipTime,
  onToggleSelect,
  onMovePosition,
  currentRole
}) => {
  const selectedClips = clips.filter((c) => c.is_selected);
  const totalDuration = selectedClips.reduce((acc, c) => acc + Math.max(0, c.end_time - c.start_time), 0);

  return (
    <div className="bg-[#0f1011] border border-[#23252a] rounded-[12px] p-4 space-y-3">
      {/* Header with Total Sequence Duration */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#e4f222]" />
          <h3 className="text-xs font-semibold text-[#ffffff] uppercase tracking-wider font-mono">
            Timeline Sequencer & Trimmer
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#8a8f98]">
            Selected: <strong className="text-[#ffffff]">{selectedClips.length}</strong> / {clips.length}
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#161718] border border-[#23252a] text-[#e4f222]">
            Total Export Runtime: {totalDuration.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Horizontal Scrollable Clips Sequencer */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
        {clips.map((clip, index) => {
          const isCurrent = clip.id === selectedId;
          const duration = Math.max(0, clip.end_time - clip.start_time).toFixed(1);

          return (
            <div
              key={clip.id}
              className={`shrink-0 w-64 p-3 rounded-[8px] border transition-all duration-150 flex flex-col justify-between ${
                isCurrent
                  ? 'bg-[#161718] border-[#e4f222] shadow-sm'
                  : 'bg-[#08090a] border-[#23252a] hover:border-[#383b3f]'
              } ${!clip.is_selected ? 'opacity-50' : ''}`}
            >
              {/* Top Row: Index, Title & Checkbox */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#62666d]">#{index + 1}</span>
                    <Badge variant={isCurrent ? 'warning' : 'neutral'} text={`${Math.round(clip.confidence * 100)}%`} />
                  </div>

                  <button
                    onClick={() => onToggleSelect(clip.id)}
                    className="text-[#8a8f98] hover:text-[#ffffff] transition-colors"
                    title={clip.is_selected ? 'Exclude from export' : 'Include in export'}
                  >
                    {clip.is_selected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-[#e4f222]" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-[#62666d]" />
                    )}
                  </button>
                </div>

                <div
                  onClick={() => onSelectClip(clip.id)}
                  className="font-medium text-xs text-[#ffffff] truncate cursor-pointer hover:underline"
                >
                  {clip.title}
                </div>
              </div>

              {/* Middle: Trim Sliders & Steppers (for Editor) */}
              <div className="my-2 pt-2 border-t border-[#23252a]/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8a8f98]">
                  <span>Range:</span>
                  <span className="text-[#ffffff]">
                    {clip.start_time.toFixed(1)}s - {clip.end_time.toFixed(1)}s ({duration}s)
                  </span>
                </div>

                {currentRole === 'editor' && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-[#62666d]">IN:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={clip.end_time - 0.5}
                        value={clip.start_time}
                        onChange={(e) => onUpdateClipTime(clip.id, parseFloat(e.target.value) || 0, clip.end_time)}
                        className="w-full bg-[#161718] border border-[#23252a] rounded px-1.5 py-0.5 text-[10px] font-mono text-[#ffffff] focus:outline-none focus:border-[#8a8f98]"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-[#62666d]">OUT:</span>
                      <input
                        type="number"
                        step="0.5"
                        min={clip.start_time + 0.5}
                        value={clip.end_time}
                        onChange={(e) => onUpdateClipTime(clip.id, clip.start_time, parseFloat(e.target.value) || clip.start_time + 1)}
                        className="w-full bg-[#161718] border border-[#23252a] rounded px-1.5 py-0.5 text-[10px] font-mono text-[#ffffff] focus:outline-none focus:border-[#8a8f98]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom: Reordering Controls */}
              {currentRole === 'editor' && (
                <div className="flex items-center justify-between pt-1 text-[10px] text-[#62666d] font-mono">
                  <button
                    disabled={index === 0}
                    onClick={() => onMovePosition(clip.id, 'earlier')}
                    className="p-1 rounded hover:bg-[#23252a] hover:text-[#ffffff] disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Earlier in Export Sequence"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <span>Reorder</span>
                  <button
                    disabled={index === clips.length - 1}
                    onClick={() => onMovePosition(clip.id, 'later')}
                    className="p-1 rounded hover:bg-[#23252a] hover:text-[#ffffff] disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Later in Export Sequence"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
