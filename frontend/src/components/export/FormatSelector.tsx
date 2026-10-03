import React from 'react';

export type AspectFormat = '9:16' | '1:1' | '16:9';

interface FormatSelectorProps {
  format: AspectFormat;
  onSelectFormat: (fmt: AspectFormat) => void;
}

const FORMATS: { id: AspectFormat; label: string; desc: string; iconClass: string }[] = [
  {
    id: '9:16',
    label: '9:16 Vertical',
    desc: 'Reels · TikTok · Shorts',
    iconClass: 'w-3.5 h-6 rounded-sm border-2 border-current',
  },
  {
    id: '1:1',
    label: '1:1 Square',
    desc: 'Instagram Feed · LinkedIn',
    iconClass: 'w-5 h-5 rounded-sm border-2 border-current',
  },
  {
    id: '16:9',
    label: '16:9 Widescreen',
    desc: 'YouTube · Twitter/X',
    iconClass: 'w-6 h-3.5 rounded-sm border-2 border-current',
  },
];

export const FormatSelector: React.FC<FormatSelectorProps> = ({ format, onSelectFormat }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="st-eyebrow">Aspect Ratio / Framing</label>
        <span className="st-mono text-[11px] text-[var(--st-muted)]">Canvas Crop</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {FORMATS.map((f) => {
          const isSelected = format === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFormat(f.id)}
              className={`p-4 rounded-[18px] border text-left flex items-center gap-4 transition-all duration-300 ${
                isSelected
                  ? 'border-[var(--st-text)] bg-[var(--st-surface-2)] shadow-md'
                  : 'border-[var(--st-line)] bg-[var(--st-surface)] hover:border-[var(--st-line-strong)]'
              }`}
            >
              <div
                className={`flex items-center justify-center shrink-0 w-8 h-8 ${
                  isSelected ? 'text-[var(--st-accent)]' : 'text-white/40'
                }`}
              >
                <div className={f.iconClass} />
              </div>
              <div className="min-w-0">
                <span className="block text-[14px] font-medium text-white">{f.label}</span>
                <span className="block text-[11px] text-[var(--st-muted)] truncate">{f.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
