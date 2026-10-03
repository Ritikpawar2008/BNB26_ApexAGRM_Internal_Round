import React from 'react';
import { formatSecondsToTime } from '../../utils/timeFormatter';

interface StudioHeroProps {
  filename?: string;
  sourceDuration: number;
  momentCount: number;
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const toWord = (n: number) => NUMBER_WORDS[n] ?? String(n);

const STEPS = ['Raw footage', 'AI understanding', 'Moments detected', 'Edit & refine'];

/** Editorial opening statement that tells the whole story in one line. */
export const StudioHero: React.FC<StudioHeroProps> = ({ filename, sourceDuration, momentCount }) => (
  <section className="pt-16 pb-14 st-rise">
    <p className="st-eyebrow mb-8 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="st-mono normal-case tracking-normal text-[12px] text-[var(--st-text)]">
        {filename ?? 'source.mp4'}
      </span>
      <span className="text-[var(--st-faint)]">—</span>
      <span>{formatSecondsToTime(sourceDuration)} source</span>
      <span className="text-[var(--st-faint)]">—</span>
      <span>Analyzed by Gemini</span>
    </p>

    <h1 className="st-display text-[44px] sm:text-[64px] xl:text-[88px] max-w-[14ch]">
      One long video.
      <br />
      <span className="text-[var(--st-faint)]">
        {toWord(momentCount).replace(/^./, (c) => c.toUpperCase())} moments worth sharing.
      </span>
    </h1>

    <ol className="mt-14 grid grid-cols-2 md:grid-cols-4 border-t st-hairline">
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
  </section>
);
