import React from 'react';

interface ExportProgressProps {
  progress: number;
  format: string;
  clipCount: number;
  platformName: string;
  durationFormatted: string;
}

const pad = (n: number) => n.toString().padStart(2, '0');

const getStages = (format: string) => [
  { at: 0, title: 'Preparing clips', desc: 'Slicing verified I-frame boundaries across source video' },
  { at: 35, title: 'Applying platform format', desc: `Re-framing canvas to ${format} and aligning safe-zones` },
  { at: 70, title: 'Stamping verbal hooks', desc: 'Burning synchronized typography overlays and captions' },
  { at: 90, title: 'Finalizing export', desc: 'Normalizing loudness to -14 LUFS and encoding MP4 container' },
];

export const ExportProgress: React.FC<ExportProgressProps> = ({
  progress,
  format,
  clipCount,
  platformName,
  durationFormatted,
}) => {
  const stages = getStages(format);
  const currentStage = [...stages].reverse().find((s) => progress >= s.at) || stages[0];

  return (
    <div className="st-surface p-10 md:p-16 text-center max-w-3xl mx-auto border-[var(--st-line-strong)] shadow-2xl relative overflow-hidden st-rise">
      {/* Calm ambient background light */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 90, 54, 0.35) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Editorial Eyebrow Metadata */}
        <p className="st-eyebrow flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--st-accent)] st-pulse" />
          <span>{pad(clipCount)} CLIPS</span>
          <span className="text-[var(--st-faint)]">/</span>
          <span>{durationFormatted}</span>
          <span className="text-[var(--st-faint)]">/</span>
          <span>{format} {platformName.toUpperCase()}</span>
        </p>

        {/* Large Editorial Headline */}
        <h2 className="st-display text-[44px] md:text-[68px] text-white tracking-tight">
          Preparing your content.
        </h2>

        {/* Current Stage Headline & Description */}
        <div className="my-8 text-center min-h-[64px] flex flex-col justify-center">
          <span className="text-[17px] font-medium text-white block">
            {currentStage.title}
          </span>
          <span className="text-[13px] text-[var(--st-muted)] block mt-1">
            {currentStage.desc}
          </span>
        </div>

        {/* Restrained Progress Rail */}
        <div className="w-full max-w-lg bg-white/10 h-1.5 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-[var(--st-accent)] rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full max-w-lg mt-3 text-[11px] st-mono text-[var(--st-muted)]">
          <span>CREATORAI PIPELINE</span>
          <span className="text-white font-medium">{Math.round(progress)}%</span>
          <span>1080P MASTER</span>
        </div>

        {/* Calm 4-step progress strip */}
        <div className="mt-12 pt-8 border-t st-hairline w-full max-w-lg grid grid-cols-4 gap-2 text-left">
          {stages.map((s, idx) => {
            const isDone = progress >= (stages[idx + 1]?.at ?? 100);
            const isCurrent = progress >= s.at && !isDone;
            return (
              <div key={s.title} className="flex flex-col gap-1">
                <span
                  className={`st-mono text-[10px] ${
                    isDone
                      ? 'text-emerald-400'
                      : isCurrent
                      ? 'text-[var(--st-accent)]'
                      : 'text-white/20'
                  }`}
                >
                  {isDone ? '✓ 0' + (idx + 1) : '0' + (idx + 1)}
                </span>
                <span
                  className={`text-[11px] leading-tight font-normal ${
                    isCurrent ? 'text-white font-medium' : isDone ? 'text-white/70' : 'text-white/30'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
