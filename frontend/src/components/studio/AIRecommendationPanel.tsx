import React, { useMemo } from 'react';
import { Clip } from '../../types/project';
import { ClipCard } from './ClipCard';

interface AIRecommendationPanelProps {
  clips: Clip[];
  selectedId?: string;
  onSelect: (clip: Clip) => void;
  onPreview: (clip: Clip) => void;
}

const pad = (n: number) => n.toString().padStart(2, '0');

/** Pulls #topics out of the AI-written captions so we surface real analysis data. */
const extractTopics = (clips: Clip[]) => {
  const seen = new Set<string>();
  clips.forEach((c) => (c.caption.match(/#[\p{L}\d_]+/gu) ?? []).forEach((t) => seen.add(t.slice(1))));
  return Array.from(seen).slice(0, 6);
};

/** "AI FOUND · 03 MOMENTS" — the discovery column next to the player. */
export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({ clips, selectedId, onSelect, onPreview }) => {
  const topics = useMemo(() => extractTopics(clips), [clips]);
  const avgConfidence = clips.length
    ? Math.round((clips.reduce((sum, c) => sum + c.confidence, 0) / clips.length) * 100)
    : 0;
  const totalSeconds = Math.round(clips.reduce((sum, c) => sum + (c.end_time - c.start_time), 0));

  return (
    <aside className="flex flex-col">
      <div className="px-5">
        <p className="st-eyebrow flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--st-accent)]" />
          AI found
        </p>
        <div className="flex items-end gap-4 mt-3">
          <span className="st-display text-[112px] xl:text-[132px] leading-[0.8]">{pad(clips.length)}</span>
          <span className="pb-2 text-[15px] text-[var(--st-muted)] leading-tight">
            moments
            <br />
            worth clipping
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-4 mt-8 pt-5 border-t st-hairline">
          <div>
            <dt className="st-eyebrow !text-[10px]">Avg. confidence</dt>
            <dd className="st-mono text-[15px] mt-1.5">{avgConfidence}%</dd>
          </div>
          <div>
            <dt className="st-eyebrow !text-[10px]">Short-form runtime</dt>
            <dd className="st-mono text-[15px] mt-1.5">{totalSeconds}s</dd>
          </div>
        </dl>

        {topics.length > 0 && (
          <div className="mt-6">
            <p className="st-eyebrow !text-[10px] mb-3">Detected topics</p>
            <ul className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <li
                  key={t}
                  className="px-3 py-1 rounded-full border border-[var(--st-line-strong)] text-[12px] text-[var(--st-muted)]"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ol className="mt-8 flex flex-col gap-1">
        {clips.map((clip, i) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            index={i + 1}
            isSelected={clip.id === selectedId}
            onSelect={() => onSelect(clip)}
            onPreview={() => onPreview(clip)}
          />
        ))}
      </ol>
    </aside>
  );
};
