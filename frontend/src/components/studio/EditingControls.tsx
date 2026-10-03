import React, { useLayoutEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { Clip } from '../../types/project';
import { formatSecondsToTime } from '../../utils/timeFormatter';

interface EditingControlsProps {
  clip: Clip;
  index: number;
  /** The untouched AI suggestion, used for "restore". */
  original?: Clip;
  onUpdate: (updated: Partial<Pick<Clip, 'hook' | 'caption'>>) => void;
}

const pad = (n: number) => n.toString().padStart(2, '0');

/** Textarea that grows with its content — feels like writing, not filling a form. */
const AutoGrowText: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', value, ...props }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} rows={1} value={value} className={`st-write ${className}`} {...props} />;
};

const RestoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 text-[12px] text-[var(--st-muted)] hover:text-[var(--st-text)] transition-colors st-fade"
  >
    <RotateCcw className="w-3 h-3" /> Restore AI suggestion
  </button>
);

/** Hook + caption editors for the selected clip. */
export const EditingControls: React.FC<EditingControlsProps> = ({ clip, index, original, onUpdate }) => {
  const hookWords = clip.hook.trim() ? clip.hook.trim().split(/\s+/).length : 0;
  const readSeconds = Math.max(1, Math.round(hookWords / 3.2));
  const hashtags = clip.caption.match(/#[\p{L}\d_]+/gu) ?? [];

  return (
    <section className="py-16 border-t st-hairline">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
        <div>
          <p className="st-eyebrow">Editing clip {pad(index)}</p>
          <h2 className="st-display text-[40px] md:text-[52px] mt-3">{clip.title}</h2>
        </div>
        <p className="st-mono text-[12px] text-[var(--st-muted)]">
          {formatSecondsToTime(clip.start_time)} — {formatSecondsToTime(clip.end_time)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-14">
        {/* HOOK */}
        <div key={`hook-${clip.id}`} className="lg:col-span-7 st-fade">
          <div className="flex items-center justify-between mb-5">
            <label htmlFor="studio-hook" className="st-eyebrow">
              Hook
            </label>
            {original && original.hook !== clip.hook && <RestoreButton onClick={() => onUpdate({ hook: original.hook })} />}
          </div>
          <div className="border-l-2 border-[#ff5a36] pl-6 lg:pl-8">
            <AutoGrowText
              id="studio-hook"
              value={clip.hook}
              onChange={(e) => onUpdate({ hook: e.target.value })}
              placeholder="Write the first line viewers will hear…"
              maxLength={140}
              className="text-[30px] md:text-[40px] leading-[1.12] tracking-[-0.025em] font-light"
            />
          </div>
          <p className="mt-5 pl-6 lg:pl-8 st-mono text-[11px] text-[var(--st-muted)] flex gap-5">
            <span>{clip.hook.length}/140</span>
            <span>
              ~{readSeconds}s to read{' '}
              {readSeconds <= 3 ? <span className="text-emerald-400/80">· scroll-stopping</span> : <span>· consider tightening</span>}
            </span>
          </p>
        </div>

        {/* CAPTION */}
        <div key={`caption-${clip.id}`} className="lg:col-span-5 st-fade">
          <div className="flex items-center justify-between mb-5">
            <label htmlFor="studio-caption" className="st-eyebrow">
              Caption
            </label>
            {original && original.caption !== clip.caption && (
              <RestoreButton onClick={() => onUpdate({ caption: original.caption })} />
            )}
          </div>
          <div className="st-surface !rounded-[22px] p-6 focus-within:border-[var(--st-line-strong)] transition-colors">
            <AutoGrowText
              id="studio-caption"
              value={clip.caption}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              placeholder="Supporting text for the post…"
              maxLength={2200}
              className="text-[17px] leading-relaxed min-h-[96px]"
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t st-hairline">
              <span className="st-mono text-[11px] text-[var(--st-muted)]">{hashtags.length} hashtags</span>
              <span className="st-mono text-[11px] text-[var(--st-muted)]">{clip.caption.length}/2200</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
