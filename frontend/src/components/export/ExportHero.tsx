import React from 'react';
import { formatSecondsToTime } from '../../utils/timeFormatter';

interface ExportHeroProps {
  clipCount: number;
  totalDuration: number;
  platformName: string;
  format: string;
}

const pad = (n: number) => n.toString().padStart(2, '0');

const STEPS = [
  'Raw footage',
  'AI understanding',
  'Moments detected',
  'Edit & refine',
  'Platform export',
];

export const ExportHero: React.FC<ExportHeroProps> = ({
  clipCount,
  totalDuration,
  platformName,
  format,
}) => {
  return (
    <section className="pt-16 pb-14 st-rise">
      <p className="st-eyebrow mb-8 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="st-mono text-[12px] text-[var(--st-text)]">{pad(clipCount)} CLIPS STITCHED</span>
        <span className="text-[var(--st-faint)]">—</span>
        <span>{formatSecondsToTime(totalDuration)} total runtime</span>
        <span className="text-[var(--st-faint)]">—</span>
        <span>Target: {platformName} ({format})</span>
      </p>

      <h1 className="st-display text-[44px] sm:text-[64px] xl:text-[88px] max-w-[16ch]">
        Your content,
        <br />
        <span className="text-[var(--st-faint)]">ready to ship.</span>
      </h1>

      <ol className="mt-14 grid grid-cols-2 md:grid-cols-5 border-t st-hairline">
        {STEPS.map((step, i) => {
          const current = i === STEPS.length - 1;
          return (
            <li key={step} className="pt-5 pr-6 flex items-baseline gap-3">
              <span className={`st-mono text-[11px] ${current ? 'text-[var(--st-accent)]' : 'text-[var(--st-faint)]'}`}>
                0{i + 1}
              </span>
              <span className={`text-[14px] ${current ? 'text-[var(--st-text)]' : 'text-[var(--st-muted)]'}`}>
                {step}
              </span>
              {!current && <span className="text-[var(--st-faint)] text-[12px]">✓</span>}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 border-t st-hairline pt-6">
        <div>
          <span className="st-eyebrow !text-[10px] block">Cuts</span>
          <span className="st-mono text-[20px] font-light mt-1 block">{pad(clipCount)} segments</span>
        </div>
        <div>
          <span className="st-eyebrow !text-[10px] block">Resolution</span>
          <span className="st-mono text-[20px] font-light mt-1 block">
            {format === '9:16' ? '1080 × 1920' : format === '1:1' ? '1080 × 1080' : '1920 × 1080'}
          </span>
        </div>
        <div>
          <span className="st-eyebrow !text-[10px] block">Audio Pacing</span>
          <span className="st-mono text-[20px] font-light mt-1 block">-14 LUFS (Normalized)</span>
        </div>
        <div>
          <span className="st-eyebrow !text-[10px] block">Captions</span>
          <span className="st-mono text-[20px] font-light mt-1 block text-emerald-400">Burned in</span>
        </div>
      </div>
    </section>
  );
};
