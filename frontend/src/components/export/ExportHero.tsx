import React from 'react';
import { formatSecondsToTime } from '../../utils/timeFormatter';

interface ExportHeroProps {
  clipCount: number;
  totalDuration: number;
  platformName: string;
  format: string;
}

const pad = (n: number) => n.toString().padStart(2, '0');

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

      <div className="mt-14 grid grid-cols-2 md:grid-cols-4 border-t st-hairline pt-6">
        <div>
          <span className="st-eyebrow !text-[10px] block">Cuts</span>
          <span className="st-mono text-[20px] font-light mt-1 block">{pad(clipCount)} segments</span>
        </div>
        <div>
          <span className="st-eyebrow !text-[10px] block">Resolution</span>
          <span className="st-mono text-[20px] font-light mt-1 block">1080 × 1920</span>
        </div>
        <div>
          <span className="st-eyebrow !text-[10px] block">Encoder</span>
          <span className="st-mono text-[20px] font-light mt-1 block">H.264 / AAC</span>
        </div>
        <div>
          <span className="st-eyebrow !text-[10px] block">Captions</span>
          <span className="st-mono text-[20px] font-light mt-1 block text-emerald-400">Burned in</span>
        </div>
      </div>
    </section>
  );
};
